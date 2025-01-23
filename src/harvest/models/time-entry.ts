/**
 * Harvest time entry data models for consumption within this utility.
 * Ian French, NewOrbit Ltd, Jan 2025.
 */

import { TpBookableEntity } from "../../target-process/models/tp-bookable-entity";

// Harvest timer model. The naming of this interface has been retained from the old code base.
export interface HarvestTimer {
  user_id: number;
  project_id: number;
  task_id: number;
  spent_date: string;  // a partial ISO date e.g. "2017-03-21"
  hours: number;
  notes?: string;
}

// Harvest time entry model. The naming of this interface has been retained from the old code base.
export interface HarvestTimeEntry {
  id: number;
  notes: string[];
  metadata: NoteMetadata | null;
  hours: number;
  created: string;
  running: boolean;
}

// Model to hold information about the notes field of a Harvest time entry.
export interface NoteMetadata {
  tpBookableEntity: TpBookableEntity | null;
  finished: boolean;
  version: string;
}

// Model to define the raw response from the Harvest API when requesting time entries.
export interface RawHarvestTimeEntryResponse {
  time_entries: RawHarvestTimeEntry[];
}

// Model to define the raw structure of a time entry from the Harvest API. This is only
// a subset of the actual properties returned.
export interface RawHarvestTimeEntry {
  id: number;
  hours: number;
  notes: string;
  created_at: string;
  is_running: boolean;
}
