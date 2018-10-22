import * as inquirer from "inquirer";
import { HarvestApi, HarvestTimeEntry } from "../../harvest/api";
import { NoteInformation, EntityType } from "../../harvest/notes/note-information";
import { log } from "../../utils/log";
import { getTargetprocessEntity } from "../../utils/get-tp-entity";
import { getProjectedTimeRemaining } from "../../utils/get-projected-time-remaining";
import { ApiProvider } from "../../api-provider";

const getEntityTypeText = (type: EntityType) => type === EntityType.BUG ? "bug" : "task";
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

const askTimeEntry = async (harvest: HarvestApi, date: string) => {
    const entries = await harvest.getTimeEntries(date);

    const unfinished = getUnfinishedTimeEntries(entries);

    if (unfinished.length === 0) {
        log.info("There are no unfinished time entries today.");
        return null;
    }

    const prompts = unfinished.map(getTimeEntryPrompt);

    const { timeEntry } = await inquirer.prompt<{ timeEntry: HarvestTimeEntry }>({
        name: "timeEntry",
        message: "Which timer would you like to finish?",
        type: "list",
        choices: prompts
    });

    return timeEntry;
};

const askTimeRemaining = async (tpEntity: any, timeEntry: HarvestTimeEntry) => {
    const projectedTimeRemaining = getProjectedTimeRemaining(tpEntity.TimeRemain, timeEntry.hours);

    const { timeRemaining } = await inquirer.prompt<{ timeRemaining: number }>({
        name: "timeRemaining",
        message: "How much time remaining? Projected: " + projectedTimeRemaining.toFixed(2),
        validate: input => isNaN(input) ? "Enter a numeric value" : true,
        filter: input => parseFloat(input)
    });

    return timeRemaining;
};

export const askFinishDetails = async (apiProvider: ApiProvider, date: string) => {
    const harvestApi = apiProvider.getHarvestApi();

    const timeEntry = await askTimeEntry(harvestApi, date);

    if (timeEntry === null) {
        return null;
    }

    const targetprocessApi = apiProvider.getTargetprocessApi();
    const tpEntity = await getTargetprocessEntity(targetprocessApi, timeEntry.notes.entity.id);

    const timeRemaining = await askTimeRemaining(tpEntity, timeEntry);

    return {
        tpEntity,
        timeEntry,
        timeRemaining
    };
};
