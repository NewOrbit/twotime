import * as inquirer from "inquirer";
import { Targetprocess } from "targetprocess-rest-api";
import { HarvestApi } from "../harvest/api";
import { askStartDetails } from "./prompts/start";
import { createNotes } from "../harvest/notes";

// YYYY-MM-DD
const getTodayDate = () => (new Date()).toISOString().slice(0,10);

export const start = async (harvest: HarvestApi, tp: Targetprocess) => {
    const details = await askStartDetails(harvest, tp);

    if (details === null) {
        return;
    }

    const notes = createNotes(details.entity, details.notes);
    const date = getTodayDate();

    await harvest.startTimeEntry(details.projectId, details.taskId, date, notes, details.hours, details.running);
};
