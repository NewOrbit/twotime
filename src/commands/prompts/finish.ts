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

const askTimeRemaining = async (tpEntity: any, timeEntry: HarvestTimeEntry) => {
    const projectedTimeRemaining = getProjectedTimeRemaining(tpEntity.TimeRemain, timeEntry.hours);

    log.info(`${ timeEntry.notes.entity.name } (#${ timeEntry.notes.entity.id })`);
    log.info(`> Projected hours remaining: ${ projectedTimeRemaining.toFixed(2) }`);

    const { timeRemaining } = await inquirer.prompt<{ timeRemaining: string }>({
        name: "timeRemaining",
        message: "How many hours remaining?",
        validate: input => {
            if (input === null || input.length === 0) {
                return "You must enter a value.";
            }

            if (isNaN(input)) {
                return "Please enter a numeric value.";
            }

            return true;
        }
    });

    return parseFloat(timeRemaining);
};

const getTimeEntries = async (harvestApi: HarvestApi, date: string, all: boolean) => {
    const entries = await harvestApi.getTimeEntries(date);

    const unfinished = getUnfinishedTimeEntries(entries);

    if (unfinished.length === 0) {
        log.info(`There are no unfinished time entries on ${date}.`);
        return [];
    }

    if (all) {
        return unfinished;
    }

    const prompts = unfinished.map(getTimeEntryPrompt);

    const { timeEntry } = await inquirer.prompt<{ timeEntry: HarvestTimeEntry }>({
        name: "timeEntry",
        message: "Which timer would you like to finish?",
        type: "list",
        choices: prompts
    });

    return [ timeEntry ];
};

export const askFinishDetails = async (apiProvider: ApiProvider, date: string, all: boolean) => {
    const harvestApi = apiProvider.getHarvestApi();

    const timeEntries = await getTimeEntries(harvestApi, date, all);

    const targetprocessApi = apiProvider.getTargetprocessApi();

    const finishDetails = [];

    for (const timeEntry of timeEntries) {
        const tpEntity = await getTargetprocessEntity(targetprocessApi, timeEntry.notes.entity.id);

        const timeRemaining = await askTimeRemaining(tpEntity, timeEntry);

        finishDetails.push({
            tpEntity,
            timeEntry,
            timeRemaining
        });
    }

    return finishDetails;
};
