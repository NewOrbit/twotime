import * as inquirer from "inquirer";
import { HarvestProject, HarvestApi } from "../../harvest/api";
import { Targetprocess } from "targetprocess-rest-api";
import { getTargetprocessEntity } from "../../utils/get-tp-entity";
import { askConfirm } from "./confirm";
import { log } from "../../utils/log";

const promptTargetprocessId = async () => {
    const response = await inquirer.prompt<{ tp: string }>({
        name: "tp",
        message: "Enter a Targetprocess task or bug ID"
    });

    const parsed = parseInt(response.tp);

    if (isNaN(parsed)) {
        return null;
    }

    return parsed;
};

const askTargetprocessEntity = async (tp: Targetprocess) => {
    const id = await promptTargetprocessId();

    if (id === null) {
        return null;
    }

    const entity = await getTargetprocessEntity(tp, id);

    if (entity.ResourceType === "UserStory") {
        log.error("You cannot log time directly to a user story");

        // ask for it again, keep prompting recursively until we get a good answer
        return await askTargetprocessEntity(tp);
    }

    if (entity !== null) {
        if (entity.UserStory) {
            log.info(`> user story: #${entity.UserStory.Id} ${entity.UserStory.Name}`);
        } else {
            log.info("> user story: none");
        }
    
        log.info(`> ${entity.ResourceType.toLowerCase()}: #${entity.Id} ${entity.Name}`);
    }    

    return entity;
};

const getAnswerChoices = (project: HarvestProject) => project.tasks.map(t => ({
    value: t.id,
    name: t.name
}));

const askHarvestDetails = async (harvest: HarvestApi) => {
    const projects = await harvest.getProjects();

    const choices = projects.map(p => ({
        value: p,
        name: p.name
    }));
    
    const response = await inquirer.prompt<{ project: HarvestProject, taskId: number }>([{
        name: "project",
        message: "Which project?",
        type: "list",
        choices: choices
    }, {
        name: "taskId",
        message: "What kind of task?",
        type: "list",
        choices: answers => getAnswerChoices(answers.project)
    }]);

    return {
        projectId: response.project.id,
        taskId: response.taskId
    };
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

    return {
        hours: response.hours,
        running: response.hours === 0 || response.running
    };
};

export const askStartDetails = async (harvest: HarvestApi, tp: Targetprocess) => {
    const entity = await askTargetprocessEntity(tp);    
    const { projectId, taskId } = await askHarvestDetails(harvest);
    const notes = await askNotes();
    const { hours, running } = await askTimeSpent();
    const confirm = await askConfirm();

    if (confirm === null) {
        return null;
    }
    
    return {
        entity,
        projectId,
        taskId,
        notes,
        hours,
        running
    }
};
