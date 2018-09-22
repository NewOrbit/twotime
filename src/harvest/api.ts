import Harvest, { ProjectAssignment, TimeEntry, Project, TaskAssignment, Task } from "harvest";

interface ProjectAssignmentsResponse {
    project_assignments: ProjectAssignment[];
}

interface TimeEntriesResponse {
    time_entries: TimeEntry[];
}

export class HarvestApi {

    private api: Harvest;

    constructor(accessToken: string, accountId: number) {
        this.api = new Harvest({
            subdomain: 'neworbit',
            userAgent: 'twotime',
            concurrency: 1,
            auth: { accessToken, accountId: (accountId as any) }
        });
    }

    private getActiveTasksFromAssignments(assignments: TaskAssignment[]) {
        const activeAssignments = assignments.filter(t => t.is_active);

        return activeAssignments.map(t => ({
            id: (t.task as Task).id,
            name: (t.task as Task).name
        }));
    }

    public async getProjects() {
        const res: ProjectAssignmentsResponse = await this.api.projectAssignments.me({});

        const activeAssignments = res.project_assignments.filter(p => p.is_active);

        return activeAssignments
            .map(p => ({
                // casts here required until https://github.com/simplyspoke/node-harvest/pull/118
                id: (p.project as Project).id,
                name: (p.project as Project).name,
                
                tasks: this.getActiveTasksFromAssignments(p.task_assignments)
            }));
    }

    public async startTimeEntry(projectId: number, taskId: number, date: string, notes: string) {
        // cast to any required until https://github.com/simplyspoke/node-harvest/pull/116
        const data: any = {
            project_id: projectId,
            task_id: taskId,
            spent_date: date,
            notes: notes
        };

        // cast to TimeEntry required until https://github.com/simplyspoke/node-harvest/issues/119
        return await this.api.timeEntries.create(data) as TimeEntry;
    }

    public async getTimeEntries(date: string) {
        const query = {
            from: date,
            to: date
        };

        const res: TimeEntriesResponse = await this.api.timeEntries.list(query);

        return res.time_entries
            .map(t => ({
                id: t.id,
                notes: t.notes,
            }));
    }

    public async updateNotes(timeEntryId: number, notes: string) {
        // cast to TimeEntry required until https://github.com/simplyspoke/node-harvest/issues/119
        return await this.api.timeEntries.update(timeEntryId, { notes }) as TimeEntry;
    }

    public async stopTimeEntry(id: number) {
        // cast to TimeEntry required until https://github.com/simplyspoke/node-harvest/issues/119
        return await this.api.timeEntries.stop(id) as TimeEntry;
    }
}
