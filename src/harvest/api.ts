import Harvest from "harvest";
import { TimeEntry } from "harvest/dist/models/timeEntries.models";
import { Project } from "harvest/dist/models/projects.models";
import { TaskAssignment } from "harvest/dist/models/taskAssignments.models";
import { Task } from "harvest/dist/models/tasks.models";

import { parseNotes } from "./notes/parse-notes";
import { NoteInformation } from "./notes/note-information";

// TODO: move this into the API
export interface HarvestProject {
    id: number;
    name: string;
    tasks: {
        id: number;
        name: string;
    }[];
}

export interface HarvestTimeEntry {
    id: number;
    notes: NoteInformation;
    hours: number;
    created: string;
    running: boolean;
    text: string;
}

export class HarvestApi {

    private api: Harvest;

    constructor(accessToken: string, accountId: number) {
        this.api = new Harvest({
            subdomain: "neworbit",
            userAgent: "twotime",
            concurrency: 1,
            auth: { accessToken, accountId: (accountId as any) }
        });
    }

    public async getProjects() {
        const res = await this.api.projectAssignments.me({});

        const activeAssignments = res.project_assignments.filter(p => p.is_active);

        return activeAssignments
            .map(p => ({
                // casts here required until https://github.com/simplyspoke/node-harvest/pull/118
                id: (p.project as Project).id,
                name: (p.project as Project).name,

                tasks: this.getActiveTasksFromAssignments(p.task_assignments)
            }) as HarvestProject);
    }

    public async startTimeEntry(projectId: number, taskId: number, date: string, notes: string, hours: number, running: boolean) {
        // cast to any required until https://github.com/simplyspoke/node-harvest/pull/116
        const data: any = {
            project_id: projectId,
            task_id: taskId,
            spent_date: date,
            notes,
            hours
        };

        const entry = await this.api.timeEntries.create(data);

        // if it doesn't need to be started manually, we can return here
        if (running === false || hours === 0) {
            return entry;
        }

        return this.resumeTimeEntry(entry.id);
    }

    public async getTimeEntries(date: string) {
        const query = {
            from: date,
            to: date
        };

        const res = await this.api.timeEntries.list(query);

        return res.time_entries.map(this.mapTimeEntry);
    }

    public async updateNotes(timeEntryId: number, notes: string) {
        // cast to TimeEntry required until https://github.com/simplyspoke/node-harvest/issues/119
        return await this.api.timeEntries.update(timeEntryId, { notes }) as TimeEntry;
    }

    public async resumeTimeEntry(id: number) {
        // cast to TimeEntry required until https://github.com/simplyspoke/node-harvest/issues/119
        return await this.api.timeEntries.restart(id) as TimeEntry;
    }

    public async stopTimeEntry(id: number) {
        // cast to TimeEntry required until https://github.com/simplyspoke/node-harvest/issues/119
        return await this.api.timeEntries.stop(id) as TimeEntry;
    }

    private getActiveTasksFromAssignments(assignments: TaskAssignment[]) {
        const activeAssignments = assignments.filter(t => t.is_active);

        return activeAssignments.map(t => ({
            id: (t.task as Task).id,
            name: (t.task as Task).name
        }));
    }

    private mapTimeEntry(entry: TimeEntry): HarvestTimeEntry {
        return {
            id: entry.id,
            hours: entry.hours,
            notes: parseNotes(entry.notes),
            text: entry.notes,
            created: entry.created_at,
            running: entry.is_running
        };
    }
}
