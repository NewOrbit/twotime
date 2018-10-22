import { askStartDetails } from "./prompts/start";
import { getTodayDate } from "../utils/get-today-date";
import { createNotes } from "../harvest/notes/create-notes";
import { createNoteInformation } from "../harvest/notes/create-note-information";
import { ApiProvider } from "../api-provider";

export const start = async (apiProvider: ApiProvider) => {
    const details = await askStartDetails(apiProvider);

    if (details === null) {
        return;
    }

    const noteInformation = createNoteInformation(details.entity);
    noteInformation.additionalNotes = [ details.notes ];

    const notes = createNotes(noteInformation);

    const date = getTodayDate();

    const harvestApi = apiProvider.getHarvestApi();

    await harvestApi.startTimeEntry(details.projectId, details.taskId, date, notes, details.hours, details.running);
};
