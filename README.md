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

## Installation

```bash
npm install -g harvest-mcp
```

Or use directly with npx:

```bash
npx harvest-mcp
```

## Authentication Setup

You have two options for authenticating with Harvest:

### Option 1: OAuth 2.0 Authentication (Recommended)

1. Run the setup command:
   ```bash
   npx harvest-mcp setup
   ```

2. The setup process will:
   - Guide you through creating a Harvest OAuth2 application
   - Open your browser for authorization
   - Store your credentials securely in your home directory

### Option 2: Personal Access Token

If you prefer to use a Personal Access Token, you can create one in Harvest:

1. Go to https://id.getharvest.com/developers
2. Create a Personal Access Token
3. Set the following environment variables:
   ```
   HARVEST_API_KEY=your_personal_access_token
   HARVEST_ACCOUNT_ID=your_account_id
   ```

4. You can also create a `.env` file in the project directory:
   ```
   HARVEST_API_KEY=your_personal_access_token
   HARVEST_ACCOUNT_ID=your_account_id
   ```

## Usage

### Command Line

```bash
# Start the MCP server
npx harvest-mcp

# Set up OAuth authentication
npx harvest-mcp setup

# Show help
npx harvest-mcp help
```

### MCP Configuration

To add this server to your MCP configuration, add the following to your MCP config file:

```json
"harvest": {
  "command": "npx",
  "args": ["harvest-mcp"]
}
```

Or with a locally installed package:

```json
"harvest": {
  "command": "node",
  "args": ["./node_modules/harvest-mcp/build/index.js"]
}
```

## Development

If you want to develop and contribute to the project:

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the server:
   ```
   npm run build
   ```
4. Run the development version:
   ```
   node build/index.js
   ```

Development commands:
- `npm run build` - Build the server
- `npm run format` - Format code using Prettier
