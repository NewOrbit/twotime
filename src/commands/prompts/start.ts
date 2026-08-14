import { confirm, input, search } from "@inquirer/prompts";

import type { Targetprocess } from "../../target-process/api.ts";

import type { HarvestProject } from "../../harvest/models/projects.ts";
import type { HarvestApi } from "../../harvest/api.ts";

import { getTargetprocessEntity } from "../../utils/get-tp-entity.ts";
import { log } from "../../utils/log.ts";
import type { ApiProvider } from "../../api-provider.ts";

import { startArrayAt } from "../../utils/start-array-at.ts";

import { EntityType, type TpBookableEntity } from "../../target-process/models/tp-bookable-entity.ts";

import { askConfirm } from "./confirm.ts";
import { askHours } from "./hours.ts";

// --- Define internal interfaces  ---
interface ValueNamePair {
    value: number;
    name: string;
}

interface HarvestIdPair {
    projectId: number;
    taskId: number;
}

interface TimeSpent {
    hours: number;
    running: boolean;
}

// --- Define external interfaces and functions

export interface TimerStartDetails {
    entity: TpBookableEntity | null;
    projectId: number;
    taskId: number;
    notes: string;
    hours: number;
    running: boolean;
}

/**
 * Ask the user for start-timer details
 * @param {ApiProvider} apiProvider the general API provider service
 * @param {number} tpId the Targetprocess entity ID
 * @returns {TimerStartDetails | null} the timer start details or null
 */
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
    const confirmed = await askConfirm();

    if (!confirmed) {
        return null;
    }

    const timerDetails: TimerStartDetails = {
        entity,
        projectId,
        taskId,
        notes,
        hours,
        running
    };

    return timerDetails;
};

// --- Define internal functions ---

const promptTargetprocessId = async () => {
    // The user might type anything, so check the value here rather than in the prompt
    const tpEntityId = await input({ message: "Enter a Targetprocess task or bug ID" });

    if (tpEntityId.length === 0 || isNaN(Number(tpEntityId))) {
        return null;
    }

    return parseInt(tpEntityId, 10);
};

const logTpEntity = (entity: TpBookableEntity | null) => {
    if (entity === null) {
        return;
    }

    if (entity.UserStory) {
        log.info(`> user story: #${entity.UserStory.Id} ${entity.UserStory.Name}`);
    } else {
        log.info("> user story: none");
    }

    log.info(`> ${entity.ResourceType?.toLowerCase() || "UNKNOWN"}: #${entity.Id} ${entity.Name}`);
};

const getLoggableTargetprocessEntity = async (targetprocessApi: Targetprocess, id: number) => {
    const entity = await getTargetprocessEntity(targetprocessApi, id);

    if (entity === null) {
        log.error(`Targetprocess entity ${ id } could not be found or access is forbidden.`);
        return null;
    }

    if (entity.ResourceType === EntityType.USERSTORY) {
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

const filterChoices = <T extends { name: string }>(choices: T[], term: string | undefined) => {
    if (!term) {
        return choices;
    }

    const uppercaseTerm = term.toUpperCase();

    return choices.filter(c => c.name.toUpperCase().includes(uppercaseTerm));
};

const getChoiceIndexForName = (choices: ValueNamePair[], name: string) => {
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

const reorderChoices = (choices: ValueNamePair[], name: string) => {
    const index = getChoiceIndexForName(choices, name);

    if (index === -1) {
        return choices;
    }

    return startArrayAt(choices, index);
};

const askHarvestDetails = async (harvest: HarvestApi, tpEntity: TpBookableEntity | null) => {
    const projects = await harvest.getMyProjects();

    const projectChoices = projects.map(p => ({ value: p, name: p.name }));

    const project = await search<HarvestProject>({
        message: "Which project?",
        source: term => filterChoices(projectChoices, term)
    });

    const taskChoices = project.tasks.map(t => ({ value: t.id, name: t.name } as ValueNamePair));

    const targetTaskName = tpEntity === null ? "Dev Management Time" : "Development";
    const orderedChoices = reorderChoices(taskChoices, targetTaskName);

    const taskId = await search<number>({
        message: "What kind of task?",
        source: term => filterChoices(orderedChoices, term)
    });

    const projectAndTaskId: HarvestIdPair = {
        projectId: project.id,
        taskId
    };

    return projectAndTaskId;
};

const askNotes = async () => {
    return input({ message: "Notes:" });
};

const askTimeSpent = async () => {
    let timeSpent: TimeSpent = {
        hours: 0,
        running: true
    };

    const hours = await askHours("How many hours have you already spent on it?", 0);

    if (hours === 0) {
        return timeSpent;
    }

    const running = await confirm({ message: "Are you still doing this?" });

    timeSpent = {
        hours,
        running
    };

    return timeSpent;
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
