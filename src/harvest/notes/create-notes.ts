import { getPrefix } from "./get-prefix";

const createLine = (entity: any) => {
    const prefix = getPrefix(entity);
    
    return `${prefix}${entity.Id} ${entity.Name}`;
};

export const createNotes = (entity: any, additionalNotes?: string) => {
    if (entity === null) {
        return "";
    }

    const lines = [];

    if (entity.UserStory) {
        const line = createLine(entity.UserStory);

        lines.push(line);
    }

    const line = createLine(entity);

    lines.push(line);

    if (additionalNotes) {
        lines.push(additionalNotes);
    }

    return lines.join("\n");
};
