import { Targetprocess } from "targetprocess-rest-api";
import { HarvestApi } from "../harvest/api";
import { askStartDetails } from "./prompts/start";
import { getTodayDate } from "../utils/get-today-date";
import { createNotes } from "../harvest/notes/create-notes";
import { createNoteInformation } from "../harvest/notes/create-note-information";

export const start = async (harvest: HarvestApi, tp: Targetprocess) => {
    const details = await askStartDetails(harvest, tp);

    if (details === null) {
        return;
    }

    const noteInformation = createNoteInformation(details.entity);
    noteInformation.additionalNotes = [ details.notes ];
    
    const notes = createNotes(noteInformation);

    const date = getTodayDate();

    await harvest.startTimeEntry(details.projectId, details.taskId, date, notes, details.hours, details.running);
};
