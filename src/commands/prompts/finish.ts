import * as inquirer from "inquirer";

import { Targetprocess } from "targetprocess-rest-api";

import { TpBookableEntity } from "../../target-process/models/tp-bookable-entity";

import { HarvestApi } from "../../harvest/api";
import { HarvestTimeEntry } from "../../harvest/models/time-entry";

import { log } from "../../utils/log";
import { getTargetprocessEntity } from "../../utils/get-tp-entity";
import { getTimeEntryPrompt } from "../../utils/get-time-entry-prompt";
import { isRunningOrUnfinished } from "../../utils/is-running-or-unfinished";

import { ApiProvider } from "../../api-provider";

import { askHours } from "./hours";

export interface FinishTimerRequest {
    timeEntry: HarvestTimeEntry;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tpEntity: any;  // TODO: Replace the 'any' with explicit type TpBookableEntity
    timeRemaining: number | null;
}

const askTimeRemaining = async (tpEntity: TpBookableEntity, timeEntry: HarvestTimeEntry) => {
    if (timeEntry.metadata === null || tpEntity.TimeRemain === undefined ) {
        return null;
    }

    log.info(`${ timeEntry.metadata.tpBookableEntity?.Name } (#${ timeEntry.metadata.tpBookableEntity?.Id })`);

    let hoursRemaining = 0.0;
    const projectedTimeRemaining = tpEntity.TimeRemain - timeEntry.hours;
    if (projectedTimeRemaining < -0.016) {
        // The projected time remaining is more than a minute over (allows for rounding error and time taken to go through this process)
        log.warn(`The time entered exceeds that remaining in TP by ${-projectedTimeRemaining.toFixed(2)} hours.` +
          " Please ensure your tech lead (or PM) is aware.");
        hoursRemaining = await askHours("How much time remaining? [no default]");  // no default passed in, so user has to type something
    } else {
        // Normal case of no overrun at this point
        hoursRemaining = await askHours(`How much time remaining? (No default; TP says ${projectedTimeRemaining.toFixed(2)} hours)`);
        const excess = hoursRemaining - projectedTimeRemaining;
        if (excess > 0.016) {
            log.warn(`The time entered will exceed that remaining in TP by ${excess.toFixed(2)} hours. Please ensure your tech lead (or PM) is aware.`);
        }
    }

    return hoursRemaining;
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
    if (timeEntry.metadata === null || timeEntry.metadata.tpBookableEntity === null) {
        return null;
    }

    return getTargetprocessEntity(targetprocessApi, timeEntry.metadata.tpBookableEntity.Id);
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
