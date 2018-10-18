import { Targetprocess } from "targetprocess-rest-api";
import { HarvestApi, HarvestTimeEntry } from "../harvest/api";
import { createNotes } from "../harvest/notes/create-notes";
import { log } from "../utils/log";
import { askFinishDetails } from "./prompts/finish";
import { getTodayDate } from "../utils/get-today-date";

const stopHarvestTimer = (harvest: HarvestApi, timeEntry: HarvestTimeEntry) => {
    timeEntry.notes.finished = true;
    const notes = createNotes(timeEntry.notes);

    const actions = [
        harvest.updateNotes(timeEntry.id, notes)
    ];

    // if the timer is running, it needs to be stopped
    if (timeEntry.running) {
        actions.push(harvest.stopTimeEntry(timeEntry.id));
    }

    return Promise.all(actions);
};

const updateTargetProcess = (tp: Targetprocess, tpEntity: any, timeEntry: HarvestTimeEntry, timeRemaining: number) => {
    return tp.addTime(tpEntity.Id, timeEntry.hours, timeRemaining, new Date(timeEntry.created), "-");
};

export const finish = async (harvest: HarvestApi, tp: Targetprocess) => {
    const date = getTodayDate();
    const details = await askFinishDetails(harvest, tp, date);

    if (details === null) {
        return;
    }

    log.info("Updating Targetprocess...");
    await updateTargetProcess(tp, details.tpEntity, details.timeEntry, details.timeRemaining);

    log.info("Updating harvest...");
    await stopHarvestTimer(harvest, details.timeEntry);
    
    log.info("Timer finished!");
};
