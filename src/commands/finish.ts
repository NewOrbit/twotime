import * as inquirer from "inquirer";

import { Targetprocess } from "targetprocess-rest-api";
import { HarvestApi, HarvestTimeEntry } from "../harvest/api";
import { getTodayDate } from "../utils/get-today-date";
import { NoteInformation, EntityType } from "../harvest/notes/note-information";
import { getTargetprocessEntity } from "../utils/get-tp-entity";
import { createNotes } from "../harvest/notes/create-notes";
import { log } from "../utils/log";

const getEntityTypeText = (type: EntityType) => type == EntityType.BUG ? "bug" : "task";
const getTimeEntryPromptText = (entry: HarvestTimeEntry) => {
    const entity = entry.notes.entity;
    const entityType = getEntityTypeText(entity.type);
    
    return `${entityType} #${entity.id} (${entry.hours} hours) ${entity.name}`;
};

const getTimeEntryPrompt = (entry: HarvestTimeEntry) => {
    const text = getTimeEntryPromptText(entry);

    return {
        value: entry,
        name: text
    };
};

const isLinkedNote = (note: NoteInformation) => note.userStory !== null || note.entity !== null;

const getUnfinishedTimeEntries = (entries: HarvestTimeEntry[]) => entries.filter(e => e.notes.finished === false && isLinkedNote(e.notes));

export const finish = async (harvest: HarvestApi, tp: Targetprocess) => {
    const date = "2018-10-16";//getTodayDate();
    const entries = await harvest.getTimeEntries(date);
    const unfinished = getUnfinishedTimeEntries(entries);

    if (unfinished.length === 0) {
        log.info("There are no unfinished time entries today.");
        return;
    }

    const prompts = unfinished.map(getTimeEntryPrompt);

    const { timeEntry } = await inquirer.prompt<{ timeEntry: HarvestTimeEntry }>({
        name: "timeEntry",
        message: "Which timer would you like to finish?",
        type: "list",
        choices: prompts
    });

    const entity = await getTargetprocessEntity(tp, timeEntry.notes.entity.id);

    const projectedTimeRemaining = 
        entity.TimeRemain > timeEntry.hours
        ? entity.TimeRemain - timeEntry.hours
        : 0;

    const { timeRemaining } = await inquirer.prompt<{ timeRemaining: number }>({
        name: "timeRemaining",
        message: "How much time remaining? Projected: " + projectedTimeRemaining.toFixed(2),
        validate: input => isNaN(input) ? "Enter a numeric value" : true,
        filter: input => parseFloat(input)
    });

    const stopTimeEntry = harvest.stopTimeEntry(timeEntry.id);
    const logTime = tp.addTime(entity.Id, timeEntry.hours, timeRemaining, new Date(date), "-");

    timeEntry.notes.finished = true;
    const notes = createNotes(timeEntry.notes);
    const updateNotes = harvest.updateNotes(timeEntry.id, notes);

    await stopTimeEntry;
    await logTime;
    await updateNotes;

    console.log("done!");
};
