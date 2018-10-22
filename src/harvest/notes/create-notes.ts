import { getPrefix } from "./get-prefix";
import { NoteInformation, TargetProcessItem, EntityType } from "./note-information";
import { prefixes } from "./prefixes";

const createLine = (prefix: string, entity: TargetProcessItem) => {
    return `${prefix}${entity.id} ${entity.name}`;
};

export const createNotes = (information: NoteInformation) => {
    if (information === null || information === undefined) {
        return "";
    }

    const lines = [];

    if (information.userStory) {
        const line = createLine(prefixes.userStory, information.userStory);

        lines.push(line);
    }

    if (information.entity) {
        const prefix = information.entity.type === EntityType.TASK
            ? prefixes.task
            : prefixes.bug;

        const line = createLine(prefix, information.entity);

        lines.push(line);
    }

    if (information.finished) {
        lines.push(prefixes.finished);
    }

    if (information.additionalNotes) {
        information.additionalNotes.forEach(line => lines.push(line));
    }

    return lines.join("\n");
};
