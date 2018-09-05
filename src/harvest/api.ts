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
            auth: { accessToken, accountId }
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

    public async startTimer(projectId: number, taskId: number, date: string, notes: string) {
        // cast to any required until https://github.com/simplyspoke/node-harvest/pull/116
        const data: any = {
            project_id: projectId,
            task_id: taskId,
            spent_date: date,
            notes: notes
        };

        const res = await this.api.timeEntries.create(data);

        console.log(res);
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
}
