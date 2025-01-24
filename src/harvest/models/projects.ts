/**
 * Harvest project data models for consumption within this utility.
 * Ian French, NewOrbit Ltd, Jan 2025 - adapted from the old code base.
 */

// Harvest task model.
export interface HarvestTask {
  id: number;
  name: string;
}

// Harvest project model. One project contains a list of tasks.
export interface HarvestProject {
  id: number;
  name: string;
  tasks: HarvestTask[];
}

// Model to define the raw response from the Harvest API when requesting projects.
export interface RawHarvestMyProjectResponse {
  project_assignments: RawHarvestProjectAssignment[];
}

// Model to define the raw structure of a project from the Harvest API. This is only
// a subset of the actual properties returned.
export interface RawHarvestProjectAssignment {
  id: number;
  is_active: boolean;
  project: RawHarvestProject;
  task_assignments: RawHarvestTaskAssignment[];
}

// Internal model to define the raw structure of a project from the Harvest API.
interface RawHarvestProject {
  id: number;
  is_billable: boolean;
  name: string;
}

// Internal model to define the raw structure of a task assignment from the Harvest API.
interface RawHarvestTaskAssignment {
  id: number;
  is_active: boolean;
  task: HarvestTask;
}
