import { HarvestTimeEntry } from "../harvest/models/time-entry";

const getPromptText = (hours: number, description: string, entity: string) => {
    return `${hours.toFixed(2)} hours - ${description} (${entity})`;
};

const getTimeEntryPromptText = (entry: HarvestTimeEntry) => {
    if (entry.metadata === null || entry.metadata.tpBookableEntity === null) {
        const description = entry.notes[0] || "no notes provided";

        return getPromptText(entry.hours, description, "no tp entity");
    }

    const entity = entry.metadata.tpBookableEntity;
    const entityType = entity.ResourceType;

    return getPromptText(entry.hours, entity.Name, `${entityType} #${entity.Id}`);
};

export const getTimeEntryPrompt = (entry: HarvestTimeEntry) => {
    const text = getTimeEntryPromptText(entry);

    return {
        value: entry,
        name: text
    };
};
