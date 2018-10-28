import { Targetprocess } from "targetprocess-rest-api";
import { HarvestApi, HarvestTimeEntry } from "../harvest/api";
import { createNotes } from "../harvest/notes/create-notes";
import { log } from "../utils/log";
import { askFinishDetails } from "./prompts/finish";
import { ApiProvider } from "../api-provider";

const stopHarvestTimer = (harvestApi: HarvestApi, timeEntry: HarvestTimeEntry) => {
    const actions = [];

    if (timeEntry.metadata !== null) {
        timeEntry.metadata.finished = true;
        const notes = createNotes(timeEntry.metadata, timeEntry.notes);

        actions.push(harvestApi.updateNotes(timeEntry.id, notes));
    }

    // if the timer is running, it needs to be stopped
    if (timeEntry.running) {
        actions.push(harvestApi.stopTimeEntry(timeEntry.id));
    }

    return Promise.all(actions);
};

const getTargetprocessTimeEntity = async (targetprocessApi: Targetprocess, tpEntity: any) => {
    // if it's not a bug, we always log the time directly
    if (tpEntity.ResourceType !== "Bug") {
        return tpEntity;
    }

    const issueTimeTo = await targetprocessApi.getCustomValueForProject(tpEntity.Project.Id, "IssueTime to");

    if (issueTimeTo === "none") {
        log.info(`Project ${tpEntity.Project.Name} (${tpEntity.Project.Id}) is not configured to log issue time`);
        return null;
    }

    if (issueTimeTo === "User story") {
        log.info(`Project ${tpEntity.Project.Name} (${tpEntity.Project.Id}) is configured to log issue time to the user story`);
        return tpEntity.UserStory;
    }

    return tpEntity;
};

const updateTargetprocess = (targetprocessApi: Targetprocess, tpEntity: any, timeEntry: HarvestTimeEntry, timeRemaining: number) => {
    const timeEntity = getTargetprocessTimeEntity(targetprocessApi, tpEntity);

    if (timeEntity === null) {
        return;
    }

    return targetprocessApi.addTime(tpEntity.Id, timeEntry.hours, timeRemaining, new Date(timeEntry.created), "-");
};

export const finish = async (apiProvider: ApiProvider, date: string, all: boolean) => {
    const timers = await askFinishDetails(apiProvider, date, all);

    const harvestApi = apiProvider.getHarvestApi();
    const targetprocessApi = apiProvider.getTargetprocessApi();

    for (const timer of timers) {
        log.info(`Finishing timer for #${ timer.timeEntry.metadata.entity.id }`);

        log.info(`> Updating Targetprocess`);
        await updateTargetprocess(targetprocessApi, timer.tpEntity, timer.timeEntry, timer.timeRemaining);

        log.info(`> Updating Harvest`);
        await stopHarvestTimer(harvestApi, timer.timeEntry);

        log.info(`> Timer finished\n`);
    }

    log.info(`Finished ${ timers.length } timers`);
};
