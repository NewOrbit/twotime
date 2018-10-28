import { getPrefix } from "./get-prefix";
import { NoteMetadata, TargetProcessItem, EntityType } from "./note-metadata";
import { prefixes } from "./prefixes";

const createLine = (prefix: string, entity: TargetProcessItem) => {
    return `${prefix}${entity.id} ${entity.name}`;
};

export const createNotes = (metadata: NoteMetadata, additionalNotes?: string[]) => {
    if (metadata === null || metadata === undefined) {
        return "";
    }

    const lines = [];

    if (metadata.userStory) {
        const line = createLine(prefixes.userStory, metadata.userStory);

        lines.push(line);
    }

    if (metadata.entity) {
        const prefix = metadata.entity.type === EntityType.TASK
            ? prefixes.task
            : prefixes.bug;

        const line = createLine(prefix, metadata.entity);

        lines.push(line);
    }

    if (metadata.finished) {
        lines.push(prefixes.finished);
    }

    if (additionalNotes) {
        additionalNotes.forEach(line => lines.push(line));
    }

    return lines.join("\n");
};
