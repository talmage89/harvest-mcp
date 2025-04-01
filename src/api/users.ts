import { makeHarvestRequest } from "../requests.js";
import { User } from "../types.js";

export async function getHarvestUser() {
  const url = "/users/me";
  return makeHarvestRequest<User>(url);
}
