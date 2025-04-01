import { getAuthDetails } from "./config.js";
import { ensureValidToken } from "./oauth.js";

const USER_AGENT = "harvest-mcp/1.0";
const HARVEST_API_BASE = "https://api.harvestapp.com/v2";

export class HarvestRequestError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function makeHarvestRequest<T>(
  path: string,
  method: string = "GET",
  body?: any,
): Promise<T> {
  // Ensure we have valid tokens
  await ensureValidToken();

  // Get auth details from config or env vars
  const auth = getAuthDetails();

  if (!auth) {
    throw new HarvestRequestError(
      "Authentication not configured. Please run 'npm run setup' or set HARVEST_API_KEY and HARVEST_ACCOUNT_ID environment variables.",
      401,
    );
  }

  const url = `${HARVEST_API_BASE}/${path}`;
  const headers = {
    "User-Agent": USER_AGENT,
    Authorization: `Bearer ${auth.accessToken}`,
    "Harvest-Account-ID": auth.accountId,
    "Content-Type": "application/json",
  };

  try {
    const options: RequestInit = { headers, method };

    if (body && method !== "GET" && method !== "DELETE") {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    const responseText = await response.text();

    if (!response.ok) {
      throw new HarvestRequestError(
        `HTTP error! status: ${response.status}, headers: ${JSON.stringify(response.headers)}`,
        response.status,
      );
    }

    try {
      return JSON.parse(responseText) as T;
    } catch (parseError) {
      throw new HarvestRequestError(
        `Error parsing JSON response: ${parseError}`,
        500,
      );
    }
  } catch (error) {
    if (error instanceof HarvestRequestError) {
      throw error;
    }
    throw new HarvestRequestError(
      `Error making Harvest request: ${error}`,
      500,
    );
  }
}
