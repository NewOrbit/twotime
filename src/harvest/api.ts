// required until https://github.com/simplyspoke/node-harvest/pull/112
const Harvest = require("harvest");

interface ProjectAssignmentsResponse {
    project_assignments: {
        id: number,
        is_active: boolean,
        project: {
            id: number,
            name: string
        },
        client: any,
        task_assignments: {
            is_active: boolean,
            task: {
                id: number,
                name: string
            }
        }[]
    }[];
}

interface TimeEntriesResponse {
    time_entries: {
        id: number;
        notes: string;
        created_at: string;
    }[];
}

interface Project {
    id: number;
    name: string;

    tasks: Task[];
}

interface Task {
    id: number;
    name: string;
}

interface TimeEntry {
    id: number;
    notes: string;
}

export class HarvestApi {

    // required until https://github.com/simplyspoke/node-harvest/pull/112
    private api: any;

    constructor(accessToken: string, accountId: number) {
        this.api = new Harvest({
            subdomain: 'neworbit',
            userAgent: 'twotime',
            concurrency: 1,
            auth: { accessToken, accountId }
        });
    }

    public async getProjects() {
        const res: ProjectAssignmentsResponse = await this.api.projectAssignments.me();

        return res.project_assignments
            .filter(p => p.is_active)
            .map(p => ({
                id: p.project.id,
                name: p.project.name,
                
                tasks: p.task_assignments
                    .filter(t => t.is_active)
                    .map(t => ({
                        id: t.task.id,
                        name: t.task.name
                    }))
            })) as Project[];
    }

    public async startTimer(projectId: number, taskId: number, date: string, notes: string) {
        const res = await this.api.timeEntries.create({
            project_id: projectId,
            task_id: taskId,
            spent_date: date,
            notes: notes
        });

        console.log(res);
    }

    public async getTimeEntries(date: string) {
        const res: TimeEntriesResponse = await this.api.timeEntries.list({
            from: date,
            to: date
        });

        return res.time_entries
            .map(t => ({
                id: t.id,
                notes: t.notes,
            })) as TimeEntry[];
    }
}
