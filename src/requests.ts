const USER_AGENT = "timesheet-mcp/1.0 (tbergeson@startstudio.com)";
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
  const url = `${HARVEST_API_BASE}/${path}`;
  const headers = {
    "User-Agent": USER_AGENT,
    Authorization: `Bearer ${process.env.HARVEST_API_KEY}`,
    "Harvest-Account-ID": process.env.HARVEST_ACCOUNT_ID || "",
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
    throw new HarvestRequestError(
      `Error making Harvest request: ${error}`,
      500,
    );
  }
}
