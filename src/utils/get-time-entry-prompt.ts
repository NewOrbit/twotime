import { EntityType } from "../harvest/notes/note-information";
import { HarvestTimeEntry } from "../harvest/api";

const getEntityTypeText = (type: EntityType) => type === EntityType.BUG ? "bug" : "task";
const getTimeEntryPromptText = (entry: HarvestTimeEntry) => {
    const entity = entry.notes.entity;
    const entityType = getEntityTypeText(entity.type);

    return `${entityType} #${entity.id} (${entry.hours.toFixed(2)} hours) ${entity.name}`;
};

export const getTimeEntryPrompt = (entry: HarvestTimeEntry) => {
    const text = getTimeEntryPromptText(entry);

    return {
        value: entry,
        name: text
    };
};
