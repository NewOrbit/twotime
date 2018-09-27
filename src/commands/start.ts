import * as inquirer from "inquirer";
import { Targetprocess } from "targetprocess-rest-api";

import { HarvestApi } from "../harvest/api";

// TODO: move this into the API
interface HarvestProject {
    id: number;
    name: string;
    tasks: {
        id: number;
        name: string;
    }[];
}

const askTargetProcessId = async () => {
    const response = await inquirer.prompt<{ tp: string }>({
        name: "tp",
        message: "Is there a TargetProcess ID?"
    });

    const parsed = parseInt(response.tp);

    if (isNaN(parsed)) {
        return undefined;
    }

    return parsed;
};

const askHarvestProjectAndTask = async (projects: HarvestProject[]) => {
    const response = await inquirer.prompt<{ project: HarvestProject, taskId: number }>([{
        name: "project",
        message: "Which project?",
        type: "list",
        choices: projects.map(p => ({
            value: p,
            name: p.name
        }))
    }, {
        name: "taskId",
        message: "What kind of task?",
        type: "list",
        choices: answers => {
            return answers.project.tasks.map(t => ({
                value: t.id,
                name: t.name
            }))
        }
    }]);

    return response;
};

const askNotes = async () => {
    const response = await inquirer.prompt<{ notes: string }>({
        name: "notes",
        message: "Notes:"
    });

    return response.notes;
};

const askTimeSpent = async () => {
    const response = await inquirer.prompt<{ hours: number, running: boolean }>([{
        name: "hours",
        default: 0,
        message: "How many hours have you already spent on it?"
    }, {
        name: "running",
        type: "confirm",
        message: "Are you still doing this?",
        when: answers => answers.hours !== 0
    }]);

    return response;
};

const askConfirm = async () => {
    const response = await inquirer.prompt<{ confirm: boolean }>({
        name: "confirm",
        type: "confirm",
        message: "Are you happy with your selection?"
    });

    return response.confirm;
}

export const start = async (harvest: HarvestApi, tp: Targetprocess) => {
    const targetProcessId = await askTargetProcessId();

    try {
        const task = await tp.getTask(targetProcessId);
        console.log("task found");
        console.log(task);
    } catch (e) {
        try {
            const bug = await tp.getBug(targetProcessId);
            console.log("bug found");
            console.log(bug);
        } catch (e) {
            const story = await tp.getStory(targetProcessId);
            console.log("story found");
            console.log(story);
        }
    }
    
    const projects = await harvest.getProjects();

    const { project, taskId } = await askHarvestProjectAndTask(projects);

    const notes = await askNotes();

    const { hours, running } = await askTimeSpent();

    const confirm = await askConfirm();

    console.log(JSON.stringify([targetProcessId, project.id, taskId, notes, hours, running, confirm]));
};
