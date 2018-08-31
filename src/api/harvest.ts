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
        client: any
    }[];
}

interface Project {
    id: number;
    name: string;
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

        return res.project_assignments.filter(p => p.is_active).map(p => ({
            id: p.project.id,
            name: p.project.name
        }));
    }
}
