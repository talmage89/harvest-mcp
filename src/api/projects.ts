import { makeHarvestRequest } from "../requests.js";
import { ProjectAssignment } from "../types.js";

export async function getHarvestProjectAssignments() {
  const url = "/users/me/project_assignments";
  return makeHarvestRequest<{ project_assignments: ProjectAssignment[] }>(url);
}
