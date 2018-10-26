import { askStartDetails } from "./prompts/start";
import { createNotes } from "../harvest/notes/create-notes";
import { createNoteInformation } from "../harvest/notes/create-note-information";
import { ApiProvider } from "../api-provider";
import { log } from "../utils/log";

export const start = async (apiProvider: ApiProvider, date: string) => {
    const details = await askStartDetails(apiProvider);

    if (details === null) {
        log.info("No timer started");
        return;
    }

    const noteInformation = createNoteInformation(details.entity);
    noteInformation.additionalNotes = [ details.notes ];

    const notes = createNotes(noteInformation);

    const harvestApi = apiProvider.getHarvestApi();

    log.info("Starting Harvest timer...");
    await harvestApi.startTimeEntry(details.projectId, details.taskId, date, notes, details.hours, details.running);
    log.info("> Timer started");
};
