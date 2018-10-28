/* tslint:disable:no-var-requires */
const decodeHTML = require("entities").decodeHTML;
/* tslint:enable */

import { splitLines } from "../../utils/split-lines";
import { findPrefixInLines, findLinesWithoutPrefix } from "./parse-prefix";
import { prefixes } from "./prefixes";
import { splitIdAndName } from "./split-id-and-name";
import { NoteMetadata, EntityType } from "./note-metadata";

const getEntity = (lines: string[], prefix: string, type: EntityType) => {
    const entity = findPrefixInLines(lines, prefix);

    if (entity === null) {
        return null;
    }

    return {
        ...splitIdAndName(entity),
        type
    };
};

const getEntityFromLines = (lines: string[]) => {
    const task = getEntity(lines, prefixes.task, EntityType.TASK);

    if (task !== null) {
        return task;
    }

    const bug = getEntity(lines, prefixes.bug, EntityType.BUG);

    if (bug !== null) {
        return bug;
    }

    return null;
};

const getUserStory = (lines: string[]) => {
    const userStory = findPrefixInLines(lines, prefixes.userStory);

    if (userStory === null) {
        return null;
    }

    return splitIdAndName(userStory);
};

const getFinished = (lines: string[]) => {
    const finished = findPrefixInLines(lines, prefixes.finished);

    // finished doesn't have anything after the prefix so compare with ''
    return finished === "";
};

const getAdditionalNotes = (lines: string[]) => {
    return findLinesWithoutPrefix(lines, [ prefixes.task, prefixes.bug, prefixes.userStory, prefixes.finished ]);
};

const getMetadata = (lines: string[]) => {
    const userStory = getUserStory(lines);
    const entity = getEntityFromLines(lines);
    const finished = getFinished(lines);

    if (userStory === null && entity === null && finished === false) {
        return null;
    }

    return {
        userStory,
        entity,
        finished
    } as NoteMetadata;
};

export const parseNotes = (notes: string) => {
    const decoded = decodeHTML(notes);
    const lines = splitLines(decoded);

    const metadata = getMetadata(lines);
    const additionalNotes = getAdditionalNotes(lines);

    return {
        metadata,
        additionalNotes
    };
};
