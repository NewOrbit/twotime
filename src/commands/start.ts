import { Targetprocess } from "targetprocess-rest-api";
import { HarvestApi } from "../harvest/api";
import { askStartDetails } from "./prompts/start";
import { createNotes } from "../harvest/notes";
import { getTodayDate } from "../utils/get-today-date";

export const start = async (harvest: HarvestApi, tp: Targetprocess) => {
    const details = await askStartDetails(harvest, tp);

    if (details === null) {
        return;
    }

    const notes = createNotes(details.entity, details.notes);
    const date = getTodayDate();

    await harvest.startTimeEntry(details.projectId, details.taskId, date, notes, details.hours, details.running);
};
