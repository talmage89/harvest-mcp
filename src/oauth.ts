import http from "http";
import open from "open";
import { URL } from "url";
import { updateConfig, loadConfig } from "./config.js";

// OAuth endpoints
const OAUTH_AUTHORIZE_URL = "https://id.getharvest.com/oauth2/authorize";
const OAUTH_TOKEN_URL = "https://id.getharvest.com/api/v2/oauth2/token";
const OAUTH_ACCOUNTS_URL = "https://id.getharvest.com/api/v2/accounts";

// Default redirect URL
const DEFAULT_REDIRECT_HOST = "localhost";
const DEFAULT_REDIRECT_PORT = 3000;
const DEFAULT_REDIRECT_PATH = "/oauth/callback";

// Fetch token using authorization code
export async function fetchToken(
  clientId: string,
  clientSecret: string,
  code: string,
): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
  });

  const response = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "harvest-mcp",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch token: ${response.status} ${errorText}`);
  }

  return response.json();
}

// Refresh access token using refresh token
export async function refreshToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
  });

  const response = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "harvest-mcp",
      Accept: "application/json",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refresh token: ${response.status} ${errorText}`);
  }

  return response.json();
}

// Fetch accounts using access token
export async function fetchAccounts(accessToken: string): Promise<{
  user: { id: number; first_name: string; last_name: string; email: string };
  accounts: Array<{ id: number; name: string; product: string }>;
}> {
  const response = await fetch(OAUTH_ACCOUNTS_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "harvest-mcp",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch accounts: ${response.status} ${errorText}`,
    );
  }

  return response.json();
}

// Start OAuth flow
export async function startOAuthFlow(
  clientId: string,
  clientSecret: string,
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    let server: http.Server | null = null;
    const authUrl = new URL(OAUTH_AUTHORIZE_URL);

    const redirectUrl = `http://${DEFAULT_REDIRECT_HOST}:${DEFAULT_REDIRECT_PORT}${DEFAULT_REDIRECT_PATH}`;

    // Set authorization parameters
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", redirectUrl);

    // Create server to handle OAuth callback
    server = http.createServer(async (req, res) => {
      const reqUrl = new URL(req.url || "", `http://${req.headers.host}`);

      // Handle OAuth callback
      if (reqUrl.pathname === DEFAULT_REDIRECT_PATH) {
        const code = reqUrl.searchParams.get("code");
        const error = reqUrl.searchParams.get("error");

        if (error) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end(
            `<html><body><h1>Authentication Error</h1><p>${error}</p><p>Please close this window and try again.</p></body></html>`,
          );
          server?.close();
          resolve({ success: false, error });
          return;
        }

        if (!code) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end(
            "<html><body><h1>Authentication Error</h1><p>No authorization code received.</p><p>Please close this window and try again.</p></body></html>",
          );
          server?.close();
          resolve({ success: false, error: "No authorization code received" });
          return;
        }

        try {
          // Exchange code for tokens
          const tokenData = await fetchToken(clientId, clientSecret, code);

          // Fetch user accounts
          const accountsData = await fetchAccounts(tokenData.access_token);

          // Find Harvest accounts
          const harvestAccounts = accountsData.accounts.filter(
            (acc) => acc.product === "harvest",
          );

          if (harvestAccounts.length === 0) {
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end(
              "<html><body><h1>No Harvest Accounts</h1><p>No Harvest accounts found for this user.</p><p>Please close this window and try again with a different account.</p></body></html>",
            );
            server?.close();
            resolve({ success: false, error: "No Harvest accounts found" });
            return;
          }

          // Use the first Harvest account
          const harvestAccount = harvestAccounts[0];

          // Save tokens and account info
          updateConfig({
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            tokenExpiry: Date.now() + tokenData.expires_in * 1000,
            harvestAccountId: String(harvestAccount.id),
            clientId,
            clientSecret,
          });

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(
            `<html><body><h1>Authentication Successful</h1><p>You have successfully authenticated with Harvest.</p><p>You are now connected to: ${harvestAccount.name}</p><p>You can close this window and return to the terminal.</p></body></html>`,
          );
          server?.close();
          resolve({ success: true });
        } catch (error) {
          console.error("OAuth error:", error);
          res.writeHead(500, { "Content-Type": "text/html" });
          res.end(
            `<html><body><h1>Authentication Error</h1><p>${error instanceof Error ? error.message : String(error)}</p><p>Please close this window and try again.</p></body></html>`,
          );
          server?.close();
          resolve({
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
      }
    });

    // Start server and open browser
    server.listen(DEFAULT_REDIRECT_PORT, DEFAULT_REDIRECT_HOST, async () => {
      console.log(`OAuth server listening on ${redirectUrl}`);
      console.log("Opening browser for authentication...");

      try {
        await open(authUrl.toString());
        console.log(
          "If your browser does not open automatically, please go to this URL:",
        );
        console.log(authUrl.toString());
      } catch (error) {
        console.error("Failed to open browser:", error);
        console.log("Please open this URL in your browser:");
        console.log(authUrl.toString());
      }
    });

    // Handle server errors
    server.on("error", (error) => {
      console.error("Server error:", error);
      resolve({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    });

    // Set timeout
    setTimeout(
      () => {
        if (server) {
          server.close();
          resolve({ success: false, error: "Authentication timed out" });
        }
      },
      5 * 60 * 1000,
    ); // 5 minutes timeout
  });
}

// Check if token needs refresh and refresh if needed
export async function ensureValidToken(): Promise<boolean> {
  const config = loadConfig();

  // No refresh token or client credentials
  if (!config.refreshToken || !config.clientId || !config.clientSecret) {
    return false;
  }

  // Token still valid
  if (config.tokenExpiry && config.tokenExpiry > Date.now() + 60000) {
    return true;
  }

  try {
    // Refresh token
    const tokenData = await refreshToken(
      config.clientId,
      config.clientSecret,
      config.refreshToken,
    );

    // Update config with new tokens
    updateConfig({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiry: Date.now() + tokenData.expires_in * 1000,
    });

    return true;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
}
