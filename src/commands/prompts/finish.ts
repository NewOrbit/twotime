import * as inquirer from "inquirer";
import { HarvestApi, HarvestTimeEntry } from "../../harvest/api";
import { log } from "../../utils/log";
import { getTargetprocessEntity } from "../../utils/get-tp-entity";
import { getProjectedTimeRemaining } from "../../utils/get-projected-time-remaining";
import { ApiProvider } from "../../api-provider";
import { getTimeEntryPrompt } from "../../utils/get-time-entry-prompt";
import { isRunningOrUnfinished } from "../../utils/is-running-or-unfinished";
import { Targetprocess } from "targetprocess-rest-api";

export interface FinishTimerRequest {
    timeEntry: HarvestTimeEntry;
    tpEntity: any;
    timeRemaining: number | null;
}

const askTimeRemaining = async (tpEntity: any, timeEntry: HarvestTimeEntry) => {
    if (timeEntry.metadata === null) {
        return null;
    }

    const projectedTimeRemaining = getProjectedTimeRemaining(tpEntity.TimeRemain, timeEntry.hours);

    log.info(`${ timeEntry.metadata.entity.name } (#${ timeEntry.metadata.entity.id })`);
    log.info(`> Projected hours remaining: ${ projectedTimeRemaining.toFixed(2) }`);

    const { timeRemaining } = await inquirer.prompt<{ timeRemaining: string }>({
        name: "timeRemaining",
        message: "How many hours remaining?",
        default: projectedTimeRemaining,
        validate: input => {
            if (isNaN(input)) {
                return "Please enter a numeric value.";
            }

            return true;
        }
    });

    return parseFloat(timeRemaining);
};

const getTimeEntries = async (harvestApi: HarvestApi, date: string, all: boolean) => {
    const entries = await harvestApi.getTimeEntries(date);

    const unfinished = entries.filter(isRunningOrUnfinished);

    if (unfinished.length === 0) {
        log.info(`There are no non-running unfinished time entries on ${date}.`);
        return [];
    }

    if (all) {
        return unfinished;
    }

    const prompts = unfinished.map(getTimeEntryPrompt);

    const { timeEntry } = await inquirer.prompt<{ timeEntry: HarvestTimeEntry }>({
        name: "timeEntry",
        message: "Which timer would you like to finish?",
        type: "list",
        choices: prompts
    });

    return [ timeEntry ];
};

const getTargetprocessEntityForEntry = async (targetprocessApi: Targetprocess, timeEntry: HarvestTimeEntry) => {
    if (timeEntry.metadata === null) {
        return null;
    }

    return getTargetprocessEntity(targetprocessApi, timeEntry.metadata.entity.id);
};

export const askFinishDetails = async (apiProvider: ApiProvider, date: string, all: boolean) => {
    const harvestApi = apiProvider.getHarvestApi();

    const timeEntries = await getTimeEntries(harvestApi, date, all);

    const targetprocessApi = apiProvider.getTargetprocessApi();

    const finishDetails: FinishTimerRequest[] = [];

    for (const timeEntry of timeEntries) {
        const tpEntity = await getTargetprocessEntityForEntry(targetprocessApi, timeEntry);

        const timeRemaining = await askTimeRemaining(tpEntity, timeEntry);

        finishDetails.push({
            tpEntity,
            timeEntry,
            timeRemaining
        });
    }

    return finishDetails;
};
