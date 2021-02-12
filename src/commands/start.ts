import { askStartDetails } from "./prompts/start";
import { createNotes } from "../harvest/notes/create-notes";
import { createNoteMetadata } from "../harvest/notes/create-note-metadata";
import { ApiProvider } from "../api-provider";
import { log } from "../utils/log";

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

        // Issue #81: If the linked TP entity is a Task *and* its current state is 'Open' or 'Dev ready', set the task to 'In Progress'
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
        log.error(e);
    }

    log.info("> Timer started");
};
