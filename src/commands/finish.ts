import { Targetprocess } from "targetprocess-rest-api";
import { HarvestApi } from "../harvest/api";
import { createNotes } from "../harvest/notes/create-notes";
import { log } from "../utils/log";
import { askFinishDetails, FinishTimerRequest } from "./prompts/finish";
import { ApiProvider } from "../api-provider";

const stopHarvestTimer = async (harvestApi: HarvestApi, request: FinishTimerRequest, packageVersion: string) => {
    log.info(`> Updating Harvest`);

    const { timeEntry, tpEntity, timeRemaining } = request;

    if (timeEntry.metadata !== null) {
        timeEntry.metadata.finished = true;
        timeEntry.metadata.version = packageVersion;

        const notes = createNotes(timeEntry.metadata, timeEntry.notes);

        await harvestApi.updateNotes(timeEntry.id, notes);
    }

    // if the timer is running, it needs to be stopped
    if (timeEntry.running) {
        await harvestApi.stopTimeEntry(timeEntry.id);
    }
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

    log.info(`Project ${tpEntity.Project.Name} (${tpEntity.Project.Id}) is configured to log issue time to the issue`);

    return tpEntity;
};

const updateTargetprocess = async (targetprocessApi: Targetprocess, request: FinishTimerRequest) => {
    if (request.tpEntity === null) {
        return;
    }

    log.info(`> Updating Targetprocess`);

    const timeEntity = await getTargetprocessTimeEntity(targetprocessApi, request.tpEntity);

    if (timeEntity === null) {
        return;
    }

    return targetprocessApi.addTime(timeEntity.Id, request.timeEntry.hours, request.timeRemaining, new Date(request.timeEntry.created), "-");
};

const getTimerDisplayName = (request: FinishTimerRequest) => {
    if (request.tpEntity === null) {
        return `"${request.timeEntry.notes[0] || "no description"}"`;
    }

    return `#${request.tpEntity.Id}`;
};

export const finish = async (packageVersion: string, apiProvider: ApiProvider, date: string, all: boolean) => {
    const finishTimerRequests = await askFinishDetails(apiProvider, date, all);

    const harvestApi = apiProvider.getHarvestApi();
    const targetprocessApi = apiProvider.getTargetprocessApi();

    for (const request of finishTimerRequests) {
        log.info(`Finishing timer for ${ getTimerDisplayName(request) }`);

        await updateTargetprocess(targetprocessApi, request);

        await stopHarvestTimer(harvestApi, request, packageVersion);

        log.info(`> Timer finished\n`);
    }

    log.info(`Finished ${ finishTimerRequests.length } timers`);
};
