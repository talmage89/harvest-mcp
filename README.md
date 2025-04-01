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

This package is not published on npm. To use it, you need to clone the repository and build it locally:

```bash
# Clone the repository
git clone https://github.com/talmage89/harvest-mcp.git
cd harvest-mcp

# Install dependencies
npm install

# Build the package
npm run build
```

## Authentication Setup

You have two options for authenticating with Harvest:

### Option 1: OAuth 2.0 Authentication (Recommended)

1. Run the setup command:

   ```bash
   npm run setup
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
npm start

# Set up OAuth authentication
npm run setup
```

### MCP Configuration

To add this server to your MCP configuration (for example, in Cursor), add the following to your MCP config file:

```json
"harvest": {
  "command": "node",
  "args": ["/path/to/harvest-mcp/build/index.js"]
}
```

Make sure to use the absolute path to the `index.js` file.

## Development

Development commands:

- `npm run build` - Build the server
- `npm run format` - Format code using Prettier

## Troubleshooting

If you encounter issues:

1. Make sure you've completed the authentication setup
2. Check that the .env file is properly configured or environment variables are set
3. Verify your Harvest account has the necessary permissions
4. Check the console output for detailed error messages
