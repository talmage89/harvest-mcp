import { DateTime } from "luxon";
import { z } from "zod";
import { makeHarvestRequest } from "../requests.js";
import { TimeEntry } from "../types.js";

// create

type CreateTimeEntryInput = {
  project_id: number;
  task_id: number;
  spent_date?: string;
  hours?: number;
  notes?: string;
};

export const createTimeEntrySchema = z.object({
  project_id: z
    .number()
    .describe("The ID of the project to associate with this time entry"),
  task_id: z
    .number()
    .describe("The ID of the task to associate with this time entry"),
  spent_date: z
    .string()
    .datetime()
    .optional()
    .describe(
      "Date when the time was spent (ISO 8601 format), defaults to today",
    ),
  hours: z
    .number()
    .optional()
    .describe(
      "Number of hours spent (optional), starts a timer if not provided",
    ),
  notes: z
    .string()
    .optional()
    .describe("Additional notes about the time entry (optional)"),
});

export async function createTimeEntry(input: CreateTimeEntryInput) {
  createTimeEntrySchema.parse(input);
  const url = "/time_entries";
  if (!input.spent_date) {
    input.spent_date = DateTime.now().toISO();
  }
  return makeHarvestRequest<TimeEntry>(url, "POST", input);
}

// update

type UpdateTimeEntryInput = Partial<CreateTimeEntryInput> & { id: number };

export const updateTimeEntrySchema = z.object({
  id: z.number().describe("The ID of the time entry to update"),
  project_id: z
    .number()
    .optional()
    .describe(
      "The ID of the project to associate with this time entry (optional)",
    ),
  task_id: z
    .number()
    .optional()
    .describe(
      "The ID of the task to associate with this time entry (optional)",
    ),
  spent_date: z
    .string()
    .datetime()
    .optional()
    .describe("Date when the time was spent in ISO 8601 format (optional)"),
  hours: z.number().optional().describe("Number of hours spent (optional)"),
  notes: z
    .string()
    .optional()
    .describe("Additional notes about the time entry (optional)"),
});

export async function updateTimeEntry(input: UpdateTimeEntryInput) {
  updateTimeEntrySchema.parse(input);
  const url = `/time_entries/${input.id}`;
  return makeHarvestRequest<TimeEntry>(url, "PATCH", input);
}

// delete

export const deleteTimeEntrySchema = z.object({
  id: z.number().describe("The ID of the time entry to delete"),
});

export async function deleteTimeEntry(id: number) {
  deleteTimeEntrySchema.parse({ id });
  const url = `/time_entries/${id}`;
  return makeHarvestRequest<TimeEntry>(url, "DELETE");
}
