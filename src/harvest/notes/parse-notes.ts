const decodeHTML = require("entities").decodeHTML;
import { splitLines } from "../../utils/split-lines";
import { findPrefixInLines } from "./find-prefix-in-lines";
import { prefixes } from "./prefixes";
import { splitIdAndName } from "./split-id-and-name";
import { NoteInformation, EntityType } from "./note-information";

const getEntity = (lines: string[], prefix: string, type: EntityType) => {
    const entity = findPrefixInLines(lines, prefix);

    if (entity === null) {
        return null;
    }

    return {
        ...splitIdAndName(entity),
        type: type
    }
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
    return finished === '';
};

export const parseNotes = (notes: string) => {
    const decoded = decodeHTML(notes);
    const lines = splitLines(decoded);
    
    return {
        userStory: getUserStory(lines),
        entity: getEntityFromLines(lines),
        finished: getFinished(lines)
    } as NoteInformation;
};
