import { Targetprocess } from "targetprocess-rest-api";

import { ApiProvider } from "../api-provider";

import { HarvestApi } from "../harvest/api";
import { createNotes } from "../harvest/helpers/create-notes";

import { log } from "../utils/log";

import { EntityType, TpBookableEntity } from "../target-process/models/tp-bookable-entity";

import { askFinishDetails, FinishTimerRequest } from "./prompts/finish";

enum TimeIssueCheck {
    Error,
    LogTimeDirectly,
    LogTimeToUserStory,
    CantLogTime
}

const stopHarvestTimer = async (harvestApi: HarvestApi, request: FinishTimerRequest, packageVersion: string) => {
    log.info(`> Updating Harvest`);

    const timeEntry = request.timeEntry;

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

// Check where time is issued for a given TP entity
const checkTargetprocessTimeEntity = async (targetprocessApi: Targetprocess, tpEntity: TpBookableEntity) => {
    // if it's not a bug, we always log the time directly
    if (tpEntity.ResourceType !== EntityType.BUG) {
        return TimeIssueCheck.LogTimeDirectly;
    }

    // It is a bug so check its configuration for issuing time
    if (!tpEntity.Project) {
        log.error(`TP BUG ID ${tpEntity.Id} HAS NO PROJECT DETAILS - REPORT THIS.`);
        return TimeIssueCheck.Error;
    }

    const issueTimeTo: string = await targetprocessApi.getCustomValueForProject(tpEntity.Project.Id, "IssueTime to");

    if (issueTimeTo === "none") {
        log.info(`Project ${tpEntity.Project.Name} (${tpEntity.Project.Id}) is not configured to log issue time`);
        return TimeIssueCheck.CantLogTime;
    }

    if (issueTimeTo === "User story") {
        log.info(`Project ${tpEntity.Project.Name} (${tpEntity.Project.Id}) is configured to log issue time to the user story`);
        return TimeIssueCheck.LogTimeToUserStory;
    }

    log.info(`Project ${tpEntity.Project.Name} (${tpEntity.Project.Id}) is configured to log issue time to the issue`);

    return TimeIssueCheck.LogTimeDirectly;
};

const getTargetprocessNotes = (request: FinishTimerRequest, tpEntity: TpBookableEntity, isUserStory: boolean) => {
    if (isUserStory && tpEntity.UserStory) {
        const entityDescription = tpEntity.UserStory.ResourceType?.toLowerCase() || "UNKNOWN ENTITY TYPE";
        return `time spent on ${entityDescription} #${tpEntity.UserStory.Id}`;
    }

    if (request.timeEntry.notes.length > 0) {
        return request.timeEntry.notes.join("\n");
    }

    return "-";
};

const updateTargetprocess = async (targetprocessApi: Targetprocess, request: FinishTimerRequest) => {
    if (request.tpEntity === null) {
        return;
    }

    log.info(`> Updating Targetprocess`);

    const timeEntity = request.tpEntity;
    const timeIssueDirective = await checkTargetprocessTimeEntity(targetprocessApi, timeEntity);
    if (timeIssueDirective === TimeIssueCheck.Error || timeIssueDirective === TimeIssueCheck.CantLogTime) {
        return;
    }

    const notes = getTargetprocessNotes(request, timeEntity, timeIssueDirective === TimeIssueCheck.LogTimeToUserStory);

    if (timeEntity.ResourceType === EntityType.TASK && request.timeRemaining === 0 && timeEntity.Project?.Process?.Id) {
      await targetprocessApi.setTaskState(timeEntity.Id, "Done", timeEntity.Project.Process.Id);
    }

    targetprocessApi.addTime(timeEntity.Id, request.timeEntry.hours, request.timeRemaining || 0, new Date(request.timeEntry.created), notes);
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

    const pluralSuffix = finishTimerRequests.length === 1 ? "" : "s";
    log.info(`Finished ${finishTimerRequests.length} timer${pluralSuffix}.`);
};
