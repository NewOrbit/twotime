import { HarvestTimeEntry } from "../harvest/api";
import { getEntityTypeText } from "./get-entity-type-text";

const getTimeEntryPromptText = (entry: HarvestTimeEntry) => {
    const entity = entry.metadata.entity;
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
