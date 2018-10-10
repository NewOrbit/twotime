import * as inquirer from "inquirer";

import { Targetprocess } from "targetprocess-rest-api";
import { HarvestApi, HarvestTimeEntry } from "../harvest/api";
import { getTodayDate } from "../utils/get-today-date";
import { parseNotes, NoteInformation } from "../harvest/notes";

const isLinkedNote = (note: NoteInformation) => note.userStory !== null || note.bug !== null || note.task !== null;

const getUnfinishedTimers = (entries: HarvestTimeEntry[]) => {
    return entries
        .map(e => ({
            entry: e,
            notes: parseNotes(e.notes)
        }))
        .filter(e => isLinkedNote(e.notes) && !e.notes.finished);
};

const getTimedEntity = (notes: NoteInformation) => {
    if (notes.bug) {
        return { type: "bug", id: notes.bug.id, name: notes.bug.name };
    }

    if (notes.task) {
        return { type: "task", id: notes.task.id, name: notes.task.name };
    }

    return { type: "user story", id: notes.userStory.id, name: notes.userStory.name };
};

const getPromptText = ({ entry, notes }) => {
    const entity = getTimedEntity(notes);

    return `${entity.type} #${entity.id}: (${entry.hours} hours) ${entity.name}`;
};

const getTimerPrompts = (timers: { entry: HarvestTimeEntry, notes: NoteInformation }[]) => {
    return timers.map(t => {
        const entity = getTimedEntity(t.notes);
    });
}

export const finish = async (harvest: HarvestApi, tp: Targetprocess) => {
    const date = getTodayDate();
    const entries = await harvest.getTimeEntries("2018-10-03");

    const timers = getUnfinishedTimers(entries);

    const response = await inquirer.prompt<{ timer: any }>({
        name: "timer",
        message: "Which timer would you like to finish?",
        type: "list",
        choices: getTimerPrompts(timers)
    });

    console.log(response.timer);
};
