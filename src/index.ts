#!/usr/bin/env node

import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { processCli } from "./cli.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optional .env file loading
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error(`Error loading .env file: ${result.error.message}`);
  }
}

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getHarvestUser } from "./api/users.js";
import { getHarvestProjectAssignments } from "./api/projects.js";
import {
  createTimeEntry,
  deleteTimeEntry,
  updateTimeEntry,
  createTimeEntrySchema,
  updateTimeEntrySchema,
  deleteTimeEntrySchema,
} from "./api/timeEntries.js";
import { HarvestRequestError } from "./requests.js";

// ** utils **
function formatResponse(content: any, asError = false) {
  return asError
    ? {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: content,
            }),
          },
        ],
      }
    : {
        content: [{ type: "text" as const, text: JSON.stringify(content) }],
      };
}

async function callAndReturnFormatted(fn: () => Promise<any>) {
  try {
    const content = await fn();
    return formatResponse(content);
  } catch (error) {
    return formatResponse(
      error instanceof HarvestRequestError ? error.message : String(error),
      true,
    );
  }
}

// ** main **
async function main() {
  // Process CLI commands first
  const shouldStartServer = await processCli(process.argv);

  if (!shouldStartServer) {
    process.exit(0);
    return;
  }

  // Create and start the MCP server
  const server = new McpServer({
    name: "harvest",
    version: "1.0.0-dev",
  });

  // ** tools **
  // users
  server.tool(
    "get_user",
    "Get the Harvest user (usually not required, access to Harvest is granted via a Personal Access Token)",
    {},
    async () => callAndReturnFormatted(getHarvestUser),
  );

  // projects
  server.tool(
    "get_projects",
    "Get the Harvest project assignments for the current user",
    {},
    async () => callAndReturnFormatted(getHarvestProjectAssignments),
  );

  // time entries
  server.tool(
    "create_time_entry",
    "Create a time entry by project and task",
    createTimeEntrySchema.shape,
    async (args) => callAndReturnFormatted(() => createTimeEntry(args)),
  );

  server.tool(
    "update_time_entry",
    "Update a time entry by ID",
    updateTimeEntrySchema.shape,
    async (args) => callAndReturnFormatted(() => updateTimeEntry(args)),
  );

  server.tool(
    "delete_time_entry",
    "Delete a time entry by ID",
    deleteTimeEntrySchema.shape,
    async (args) => callAndReturnFormatted(() => deleteTimeEntry(args.id)),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Harvest MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
