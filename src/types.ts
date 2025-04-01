export type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  timezone: string;
  weekly_capacity: number;
  has_access_to_all_future_projects: boolean;
  is_contractor: boolean;
  is_active: boolean;
  calendar_integration_enabled: boolean;
  calendar_integration_source: string;
  created_at: string;
  updated_at: string;
  can_create_projects: boolean;
  roles: string[];
  access_roles: string[];
  permissions_claims: string[];
  avatar_url: string;
};

export type ProjectAssignment = {
  id: number;
  is_project_manager: boolean;
  is_active: boolean;
  use_default_rates: boolean;
  budget: number;
  created_at: string;
  updated_at: string;
  hourly_rate: number;
  project: Project;
  client: Client;
  task_assignments: TaskAssignment[];
};

export type Project = {
  id: number;
  name: string;
  code: string;
};

export type Client = {
  id: number;
  name: string;
};

export type TaskAssignment = {
  id: number;
  billable: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  hourly_rate: number;
  budget: number;
  task: Task;
};

export type Task = {
  id: number;
  name: string;
};

export type TimeEntry = {
  id: number;
  spent_date: string;
  user: User;
  client: Client;
  project: Project;
  task: Task;
  user_assignment: UserAssignment;
  task_assignment: TaskAssignment;
  hours: number;
  rounded_hours: number;
  notes: string;
  created_at: string;
  updated_at: string;
  is_locked: boolean;
  locked_reason: string;
  is_closed: boolean;
  is_billed: boolean;
  timer_started_at: string;
  started_time: string;
  ended_time: string;
  is_running: boolean;
  invoice: string;
  external_reference: string;
  billable: boolean;
  budgeted: boolean;
  billable_rate: number;
  cost_rate: number;
};

export type UserAssignment = {
  id: number;
  is_project_manager: boolean;
  is_active: boolean;
  budget: number;
  created_at: string;
  updated_at: string;
  hourly_rate: number;
};
