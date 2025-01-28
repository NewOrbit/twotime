import inquirer from "inquirer";

import { Targetprocess } from "targetprocess-rest-api";

import { HarvestProject } from "../../harvest/models/projects";
import { HarvestApi } from "../../harvest/api";

import { getTargetprocessEntity } from "../../utils/get-tp-entity";
import { log } from "../../utils/log";
import { ApiProvider } from "../../api-provider";

import { startArrayAt } from "../../utils/start-array-at";

import { askConfirm } from "./confirm";
import { askHours } from "./hours";

const promptTargetprocessId = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { tpEntityId } = await inquirer.prompt<{ tpEntityId: any }>({  // 'any' is valid here as they might type anything
        name: "tpEntityId",
        message: "Enter a Targetprocess task or bug ID"
    });

    if (tpEntityId === null || tpEntityId.length === 0 || isNaN(tpEntityId)) {
        return null;
    }

    return parseInt(tpEntityId, 10);
};

// TODO: Replace the 'any' with explicit type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const logTpEntity = (entity: any) => {
    if (entity === null) {
        return;
    }

    if (entity.UserStory) {
        log.info(`> user story: #${entity.UserStory.Id} ${entity.UserStory.Name}`);
    } else {
        log.info("> user story: none");
    }

    log.info(`> ${entity.ResourceType.toLowerCase()}: #${entity.Id} ${entity.Name}`);
};

const getLoggableTargetprocessEntity = async (targetprocessApi: Targetprocess, id: number) => {
    const entity = await getTargetprocessEntity(targetprocessApi, id);

    if (entity === null) {
        log.error(`Targetprocess entity ${ id } could not be found or access is forbidden.`);

        return null;
    }

    if (entity.ResourceType === "UserStory") {
        log.error("You cannot log time directly to a user story");

        return null;
    }

    return entity;
};

const askTargetprocessEntity = async (targetprocessApi: Targetprocess) => {
    // keep asking the question until the user gives nothing or a valid TP id
    while (true) {
        const tpEntityId = await promptTargetprocessId();

        if (tpEntityId === null) {
            log.info("Starting timer without linked Targetprocess entity");
            return null;
        }

        const entity = await getLoggableTargetprocessEntity(targetprocessApi, tpEntityId);

        if (entity === null) {
            // ask for it again
            continue;
        }

        return entity;
    }
};

const filterChoices = (choices: { name: string }[], input: string) => {
    return new Promise(resolve => {
        if (!input) {
            return resolve(choices);
        }

        const uppercaseInput = input.toUpperCase();
        const matching = choices.filter(p => p.name.toUpperCase().indexOf(uppercaseInput) !== -1);

        return resolve(matching);
    });
};

// TODO: Replace the 'any' with explicit type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getChoiceIndexForName = (choices: { value: any, name: string }[], name: string) => {
    const totalMatch = choices.findIndex(c => c.name.toUpperCase() === name.toUpperCase());

    if (totalMatch !== -1) {
        return totalMatch;
    }

    const startsWithMatch = choices.findIndex(c => c.name.toUpperCase().startsWith(name.toUpperCase()));

    if (startsWithMatch !== -1) {
        return startsWithMatch;
    }

    return -1;
};

// TODO: Replace the 'any' with explicit type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reorderChoices = (choices: { value: any, name: string }[], name: string) => {
    const index = getChoiceIndexForName(choices, name);

    if (index === -1) {
        return choices;
    }

    return startArrayAt(choices, index);
};

// TODO: Replace the 'any' with explicit type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const askHarvestDetails = async (harvest: HarvestApi, tpEntity: any) => {
    const projects = await harvest.getMyProjects();

    const projectChoices = projects.map(p => ({ value: p, name: p.name }));

    const { project } = await inquirer.prompt<{ project: HarvestProject, taskId: number }>([{
        name: "project",
        message: "Which project?",
        type: "autocomplete",
        // TODO: Replace the 'any' with explicit type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        source: (answers: any, input: string) => filterChoices(projectChoices, input)
        // TODO: Replace the 'any' with explicit type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any ]);

    const taskChoices = project.tasks.map(t => ({ value: t.id, name: t.name }));

    const targetTaskName = tpEntity === null ? "Dev Management Time" : "Development";
    const orderedChoices = reorderChoices(taskChoices, targetTaskName);

    const { taskId } = await inquirer.prompt<{ taskId: number }>([{
        name: "taskId",
        message: "What kind of task?",
        type: "autocomplete",
        // TODO: Replace the 'any' with explicit type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        source: (answers: any, input: string) => filterChoices(orderedChoices, input)
        // TODO: Replace the 'any' with explicit type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any ]);

    return {
        projectId: project.id,
        taskId
    };
};

const askNotes = async () => {
    const { notes } = await inquirer.prompt<{ notes: string }>({
        name: "notes",
        message: "Notes:"
    });

    return notes;
};

const askTimeSpent = async () => {
    const hours = await askHours("How many hours have you already spent on it?", 0);

    if (hours === 0) {
        return {
            hours,
            running: true
        };
    }

    const { running } = await inquirer.prompt<{ running: boolean }>([{
        name: "running",
        type: "confirm",
        message: "Are you still doing this?"
    }]);

    return {
        hours,
        running
    };
};

const askTargetprocessEntityIfRequired = async (targetprocessApi: Targetprocess, id?: number) => {
    if (id) {
        const entity = await getLoggableTargetprocessEntity(targetprocessApi, id);

        // null is used for "didn't provide an entity" rather than invalid, so we need to differentiate
        return entity === null ? undefined : entity;
    }

    const tpEntity = await askTargetprocessEntity(targetprocessApi);
    return tpEntity;
};

export const askStartDetails = async (apiProvider: ApiProvider, tpId?: number) => {
    const tp = apiProvider.getTargetprocessApi();
    const harvest = apiProvider.getHarvestApi();

    const entity = await askTargetprocessEntityIfRequired(tp, tpId);

    if (entity === undefined) {
        return null;
    }

    logTpEntity(entity);

    const { projectId, taskId } = await askHarvestDetails(harvest, entity);
    const notes = await askNotes();
    const { hours, running } = await askTimeSpent();
    const confirm = await askConfirm();

    if (!confirm) {
        return null;
    }

    return {
        entity,
        projectId,
        taskId,
        notes,
        hours,
        running
    };
};
