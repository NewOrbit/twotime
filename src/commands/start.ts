import { askStartDetails } from "./prompts/start";
import { createNotes } from "../harvest/notes/create-notes";
import { createNoteMetadata } from "../harvest/notes/create-note-metadata";
import { ApiProvider } from "../api-provider";
import { log } from "../utils/log";

export const start = async (apiProvider: ApiProvider, date: string) => {
    const details = await askStartDetails(apiProvider);

    if (details === null) {
        log.info("No timer started");
        return;
    }

    const noteInformation = createNoteMetadata(details.entity);
    const notes = createNotes(noteInformation, [ details.notes ]);

    const harvestApi = apiProvider.getHarvestApi();

    log.info("Starting Harvest timer...");
    await harvestApi.startTimeEntry(details.projectId, details.taskId, date, notes, details.hours, details.running);
    log.info("> Timer started");
};
