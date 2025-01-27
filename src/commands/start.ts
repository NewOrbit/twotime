import { createNoteMetadata, createNotes } from "../harvest/helpers/create-notes";

import { ApiProvider } from "../api-provider";

import { log } from "../utils/log";

import { askStartDetails } from "./prompts/start";

export const start = async (packageVersion: string, apiProvider: ApiProvider, date: string, tpId?: number) => {
    const details = await askStartDetails(apiProvider, tpId);

    if (details === null) {
        log.info("No timer started");
        return;
    }

    const noteInformation = createNoteMetadata(details.entity, packageVersion);
    const notes = createNotes(noteInformation, [ details.notes ]);

    const harvestApi = apiProvider.getHarvestApi();
    const targetprocessApi = apiProvider.getTargetprocessApi();

    log.info("Starting Harvest timer...");
    try {
        await harvestApi.startTimeEntry(details.projectId, details.taskId, date, notes, details.hours, details.running);

        if (details.entity &&
            details.entity.Id &&
            details.entity.ResourceType === "Task" &&
            details.entity.EntityState &&
            details.entity.EntityState.Name &&
            (details.entity.EntityState.Name.toUpperCase() === "OPEN" ||
            details.entity.EntityState.Name.toUpperCase() === "DEV READY") &&
            details.entity.Project &&
            details.entity.Project.Process &&
            details.entity.Project.Process.Id) {

            await targetprocessApi.setTaskState(details.entity.Id, "In Progress", details.entity.Project.Process.Id);
        }
    } catch (e) {
        log.error(e instanceof Error ? e.message : "An unknown error occurred");
    }

    log.info("> Timer started");
};
