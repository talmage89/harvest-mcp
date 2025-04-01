import { startOAuthFlow } from "./oauth.js";
import { isAuthConfigured, loadConfig, updateConfig } from "./config.js";
import { createInterface } from "readline";

// Create readline interface for CLI input
const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper to get input from user
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    readline.question(query, resolve);
  });
}

// Setup command to configure OAuth
export async function setupCommand(): Promise<void> {
  console.log("=== Harvest MCP Server Setup ===");

  // Check if already configured
  if (isAuthConfigured()) {
    const confirm = await question(
      "Authentication is already configured. Do you want to reconfigure? (y/N): ",
    );
    if (confirm.toLowerCase() !== "y") {
      console.log("Setup canceled. Using existing configuration.");
      readline.close();
      return;
    }
  }

  console.log("\nYou need to register an OAuth2 application in Harvest:");
  console.log("1. Go to https://id.getharvest.com/developers");
  console.log('2. Click "Create New OAuth2 Application"');
  console.log('3. Set Name to "Harvest MCP"');
  console.log('4. Set Redirect URL to "http://localhost:3000/oauth/callback"');
  console.log('5. Set Multi Account to "No"');
  console.log('6. Select only "Harvest" under Products');
  console.log('7. Click "Create Application"\n');

  const clientId = await question("Enter your Harvest OAuth2 Client ID: ");
  if (!clientId) {
    console.log("Client ID is required. Setup canceled.");
    readline.close();
    return;
  }

  const clientSecret = await question(
    "Enter your Harvest OAuth2 Client Secret: ",
  );
  if (!clientSecret) {
    console.log("Client Secret is required. Setup canceled.");
    readline.close();
    return;
  }

  // Save client credentials to config
  updateConfig({ clientId, clientSecret });

  console.log("\nStarting OAuth authentication flow...");
  const result = await startOAuthFlow(clientId, clientSecret);

  if (result.success) {
    console.log(
      "Authentication successful! Your Harvest MCP server is now configured.",
    );
  } else {
    console.error(`Authentication failed: ${result.error}`);
    console.log(
      "Please try again later or use the HARVEST_API_KEY and HARVEST_ACCOUNT_ID environment variables.",
    );
  }

  readline.close();
}

// Help command to show usage
export function helpCommand(): void {
  console.log("=== Harvest MCP Server ===");
  console.log("Usage:");
  console.log("  npx harvest-mcp                 Start the MCP server");
  console.log(
    "  npx harvest-mcp setup           Configure OAuth authentication",
  );
  console.log("  npx harvest-mcp help            Show this help message");
  console.log("\nEnvironment Variables:");
  console.log(
    "  HARVEST_API_KEY                 Your Harvest Personal Access Token (alternative to OAuth)",
  );
  console.log(
    "  HARVEST_ACCOUNT_ID              Your Harvest Account ID (required with HARVEST_API_KEY)",
  );
}

// Process CLI arguments
export async function processCli(args: string[]): Promise<boolean> {
  const command = args[2]?.toLowerCase();

  // Process commands
  switch (command) {
    case "setup":
      await setupCommand();
      return false; // Don't start the server

    case "help":
    case "--help":
    case "-h":
      helpCommand();
      return false; // Don't start the server

    default:
      // No command or unknown command - continue to server
      if (!isAuthConfigured()) {
        console.log("Authentication not configured. Please run:");
        console.log("  npx harvest-mcp setup");
        console.log(
          "or set HARVEST_API_KEY and HARVEST_ACCOUNT_ID environment variables.",
        );
        if (readline.listenerCount("line") > 0) {
          readline.close();
        }
        return false; // Don't start the server
      }
      return true; // Start the server
  }
}
