import { NoteMetadata, TargetProcessItem, EntityType } from "./note-metadata";
import { prefixes } from "./prefixes";

const createLine = (prefix: string, entity: TargetProcessItem) => {
    return `${prefix}${entity.id} ${entity.name}`;
};

const createVersionLine = (version: string) => `${prefixes.twotime} ${version}`;

const addLinesForMetadata = (lines: string[], metadata: NoteMetadata) => {
    if (metadata && metadata.userStory) {
        const line = createLine(prefixes.userStory, metadata.userStory);

        lines.push(line);
    }

    if (metadata && metadata.entity) {
        const prefix = metadata.entity.type === EntityType.TASK
            ? prefixes.task
            : prefixes.bug;

        const line = createLine(prefix, metadata.entity);

        lines.push(line);
    }

    if (metadata && metadata.finished) {
        lines.push(prefixes.finished);
    }

    if (metadata) {
        lines.push(createVersionLine(metadata.version));
    }
};

export const createNotes = (metadata: NoteMetadata, additionalNotes?: string[]) => {
    const lines = [];

    addLinesForMetadata(lines, metadata);

    if (additionalNotes) {
        additionalNotes.forEach(line => lines.push(line));
    }

    return lines.join("\n");
};
