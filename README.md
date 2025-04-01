# Harvest Time Tracking MCP Server

A Model Context Protocol (MCP) server for Harvest time tracking that enables AI assistants to create and update time entries via the Harvest API.

## Features

- Get current user information
- Retrieve project assignments
- Create time entries with project and task details
- Update existing time entries
- Delete time entries

## Prerequisites

- Node.js (v16 or higher)
- Harvest account with API access
- Harvest Personal Access Token
- Harvest Account ID

## Setup

1. Clone this repository
2. Copy the environment variables template:
   ```
   cp .env.example .env
   ```
3. Edit the `.env` file and add your Harvest credentials:
   ```
   HARVEST_API_KEY=your_personal_access_token
   HARVEST_ACCOUNT_ID=your_account_id
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Build the server:
   ```
   npm run build
   ```

## MCP Configuration

To add this server to your MCP configuration, add the following to your MCP config file:

```json
"harvest": {
  "command": "node",
  "args": ["absolute/path/to/harvest-mcp/build/index.js"]
}
```

Replace `absolute/path/to/harvest-mcp/` with the actual absolute path to this repository.

## Development

- `npm run build` - Build the server
- `npm run format` - Format code using Prettier
