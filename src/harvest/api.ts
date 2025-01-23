/**
 * Thin wrapper around the Harvest API to replace the neglected and vulnerable harvest npm package.
 * Ian French, NewOrbit Ltd, Jan 2025.
 */

import { parseNotes } from "./helpers/parse-notes";
import { HarvestProject, RawHarvestMyProjectResponse } from "./models/projects";
import { HarvestTimeEntry, HarvestTimer, RawHarvestTimeEntry, RawHarvestTimeEntryResponse } from "./models/time-entry";
import { HarvestUserData } from "./models/userdata";

/**
 * Harvest API class
 */
export class HarvestApi {
  // private subdomain = "neworbit";  // neworbit.harvestapp.com is seen in the browser plugin but doesn't work with the API
  private userAgent = "twotime";
  private baseUrlV2 = "https://api.harvestapp.com/v2";
  private accessToken: string;
  private accountId: number;

  constructor(accessToken: string, accountId: number) {
    this.accessToken = accessToken;
    this.accountId = accountId;
  }

  /**
   * Get a list of projects for the current user.
   * @returns {HarvestProject[]} a list of harvest projects for the current user.
   */
  public async getMyProjects(): Promise<HarvestProject[]> {
    const convertedProjects: HarvestProject[] = [];

    const response = await fetch(
      `${this.baseUrlV2}/users/me/project_assignments`,
      { headers: this.createHeaders() }
    );

    const rawProjects: RawHarvestMyProjectResponse = await response.json();
    if (rawProjects?.project_assignments && rawProjects.project_assignments.length > 0) {
      rawProjects.project_assignments
        .filter(pa => pa.is_active === true)
        .forEach(assignment => {
          const convertedProject: HarvestProject = {
            id: assignment.project.id,
            name: assignment.project.name,
            tasks: assignment.task_assignments.map(taskAssignment => {
              return {
                id: taskAssignment.task.id,
                name: taskAssignment.task.name
              };
            })
          };
          convertedProjects.push(convertedProject);
        });
    }

    return convertedProjects;
  }

  /**
   * Get a list of time entries for the current user on a given date.
   * @param date a partial ISO date e.g. '2025-01-14'
   * @returns {HarvestTimeEntry[]} a list of time entries for the current user on the given date.
   */
  public async getTimeEntries(date: string): Promise<HarvestTimeEntry[]> {
    const timeEntries: HarvestTimeEntry[] = [];

    const userId = await this.getMyId();
    const response = await fetch(
      `${this.baseUrlV2}/time_entries?user_id=${userId}&from=${date}&to=${date}`,
      { headers: this.createHeaders() }
    );

    const rawEntries: RawHarvestTimeEntryResponse = await response.json();
    if (rawEntries?.time_entries && rawEntries.time_entries.length > 0) {
      rawEntries.time_entries.forEach(entry => timeEntries.push(this.mapTimeEntry(entry)));
    }

    return timeEntries;
  }

  /**
   * Start a timer for a given project and task.
   * @param projectId the Harvest project ID
   * @param taskId the Harvest task ID
   * @param date the date of the time entry in partial ISO format e.g. '2025-01-14'
   * @param notes timer notes, which may include user story and task information
   * @param hours how many hours to start the timer with, i.e. already spent
   * @param running true if the timer is to be started immediately
   * @returns {number} the ID of the time entry that was started, or -1 if 'running' is false or something went wrong
   */
  public async startTimeEntry(projectId: number, taskId: number, date: string, notes: string, hours: number, running: boolean): Promise<number> {
    const userId = await this.getMyId();

    const timer: HarvestTimer = {
      user_id: userId,
      project_id: projectId,
      task_id: taskId,
      spent_date: date,
      hours,
      notes
    };

    const response = await fetch(
      `${this.baseUrlV2}/time_entries`,
      {
        method: "POST",
        headers: this.createHeaders(),
        body: JSON.stringify(timer)
      }
    );

    // Start manually if necessary
    if (response.ok) {
      if (running && hours > 0) {
        const body = await response.json() as RawHarvestTimeEntry;
        if (body) {
          const started = await this.resumeTimeEntry(body.id);
          if (started) {
            return body.id;
          } else {
            throw new Error("Failed to start time entry");
          }
        }
      }
    } else {
      throw new Error(`Failed to get time entry for project ID ${projectId} and task ID ${taskId}.`);
    }

    return -1;
  }

  /**
   * Resume a timer that has been stopped.
   * @param timeEntryId the timer ID
   * @returns {boolean} true if the timer was successfully resumed
   */
  public async resumeTimeEntry(timeEntryId: number): Promise<boolean> {
    return this.patchOperation("restart", timeEntryId);
  }

  /**
   * Stop a running timer.
   * @param timeEntryId
   * @param timeEntryId the timer ID
   * @returns {boolean} true if the timer was successfully stopped
   */
  public async stopTimeEntry(timeEntryId: number): Promise<boolean> {
    return this.patchOperation("stop", timeEntryId);
  }

  /**
   * Update the notes for a time entry.
   * @param timeEntryId the timer ID
   * @param notes the updated notes (multi-line)
   * @returns {boolean} true if the notes were successfully updated
   */
  public async updateNotes(timeEntryId: number, notes: string): Promise<boolean> {
    return this.patchOperation("", timeEntryId, notes);
  }

  // ---  Private methods  ---

  // Get the harvest user ID for the current user
  private async getMyId(): Promise<number> {
    const response = await fetch(
      `${this.baseUrlV2}/users/me`,
      { headers: this.createHeaders() }
    );

    if (response.ok) {
      const userData: HarvestUserData = await response.json();
      return userData.id;
    } else {
      throw new Error(`Failed to get user ID: ${response.statusText}`);
    }
  }

  // Single place to create the headers for the fetch requests
  private createHeaders() {
    return {
      "Authorization": `Bearer ${this.accessToken}`,
      "Harvest-Account-Id": `${this.accountId}`,
      "User-Agent": this.userAgent,
      "Content-Type": "application/json"
    };
  }

  // Map the retrieved 'raw' harvest time entry to the publicly exported version of the entry
  private mapTimeEntry(entry: RawHarvestTimeEntry): HarvestTimeEntry {
    const parsedNotes = parseNotes(entry.notes);
    return {
        id: entry.id,
        hours: entry.hours,
        notes: parsedNotes.additionalNotes,
        metadata: parsedNotes.metadata,
        created: entry.created_at,
        running: entry.is_running
    };
  }

  // Single place to perform a patch operation on a time entry - starting it, stopping it or updating the notes
  private async patchOperation(directive: string, entryId: number, updatedNotes = ""): Promise<boolean> {
    const url = directive ? `${this.baseUrlV2}/time_entries/${entryId}/${directive}` : `${this.baseUrlV2}/time_entries/${entryId}`;
    const requestInfo: RequestInit =  {
      method: "PATCH",
      headers: this.createHeaders()
    };

    if (updatedNotes) {
      requestInfo.body = JSON.stringify({ notes: updatedNotes });
    }

    const response = await fetch(url, requestInfo);
    return response.ok;
  }
}
