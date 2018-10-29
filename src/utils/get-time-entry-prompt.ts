import { HarvestTimeEntry } from "../harvest/api";
import { getEntityTypeText } from "./get-entity-type-text";

const getPromptText = (hours: number, description: string, entity: string) => {
    return `${hours.toFixed(2)} hours - ${description} (${entity})`;
};

const getTimeEntryPromptText = (entry: HarvestTimeEntry) => {
    if (entry.metadata === null) {
        const description = entry.notes[0] || "no notes provided";

        return getPromptText(entry.hours, description, "no tp entity");
    }

    const entity = entry.metadata.entity;
    const entityType = getEntityTypeText(entity.type);

    return getPromptText(entry.hours, entity.name, `${entityType} #${entity.id}`);
};

export const getTimeEntryPrompt = (entry: HarvestTimeEntry) => {
    const text = getTimeEntryPromptText(entry);

    return {
        value: entry,
        name: text
    };
};
