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

    log.info("Starting Harvest timer...");
    try {
        await harvestApi.startTimeEntry(details.projectId, details.taskId, date, notes, details.hours, details.running);
    } catch (e) {
        log.error(e);
    }

    log.info("> Timer started");
};
