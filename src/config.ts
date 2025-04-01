import fs from "fs";
import path from "path";
import os from "os";
import { z } from "zod";

// Config schema
const ConfigSchema = z.object({
  harvestAccountId: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  tokenExpiry: z.number().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

// Default config directory and file
const CONFIG_DIR = path.join(os.homedir(), ".harvest-mcp");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

// Create config directory if it doesn't exist
export function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

// Load config from file
export function loadConfig(): Config {
  ensureConfigDir();

  if (!fs.existsSync(CONFIG_FILE)) {
    return {};
  }

  try {
    const configData = fs.readFileSync(CONFIG_FILE, "utf8");
    const config = JSON.parse(configData);
    return ConfigSchema.parse(config);
  } catch (error) {
    console.error("Error loading config:", error);
    return {};
  }
}

// Save config to file
export function saveConfig(config: Config): void {
  ensureConfigDir();

  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error("Error saving config:", error);
  }
}

// Update specific config values
export function updateConfig(updates: Partial<Config>): Config {
  const currentConfig = loadConfig();
  const newConfig = { ...currentConfig, ...updates };
  saveConfig(newConfig);
  return newConfig;
}

// Check if authentication is configured
export function isAuthConfigured(): boolean {
  const config = loadConfig();
  return !!(
    config.accessToken ||
    (process.env.HARVEST_API_KEY && process.env.HARVEST_ACCOUNT_ID)
  );
}

// Get auth details (prioritize env vars over config file)
export function getAuthDetails(): {
  accessToken: string;
  accountId: string;
} | null {
  // First check environment variables
  if (process.env.HARVEST_API_KEY && process.env.HARVEST_ACCOUNT_ID) {
    return {
      accessToken: process.env.HARVEST_API_KEY,
      accountId: process.env.HARVEST_ACCOUNT_ID,
    };
  }

  // Then check config file
  const config = loadConfig();
  if (config.accessToken && config.harvestAccountId) {
    return {
      accessToken: config.accessToken,
      accountId: config.harvestAccountId,
    };
  }

  return null;
}
