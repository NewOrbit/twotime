const decodeHTML = require("entities").decodeHTML;

interface Entity {
    id: number;
    name: string;
}

interface NoteInformation {
    userStory: Entity | null;
    task: Entity | null;
    bug: Entity | null;
    finished: boolean;
}

const prefixes = {
    userStory: "> user_story #",
    task: "> task #",
    bug: "> bug #",
    finished: "> finished"
}

const splitLines = (str: string) => str.match(/[^\r\n]+/g);

const parsePrefix = (line: string, prefix: string) => {
    if (line.indexOf(prefix) !== 0) {
        return null;
    }

    const withoutPrefix = line.substring(prefix.length);

    return withoutPrefix;
};

const findPrefixInLines = (lines: string[], prefix: string) => {
    const matching = lines
        .map(l => parsePrefix(l, prefix))
        .filter(x => x !== null);

    if (matching.length === 0) {
        return null;
    }

    return matching[0];
};

const splitIdAndName = (line: string) => {
    const parts = line.split(" ");

    return {
        id: parseInt(parts[0]),
        name: parts.slice(1).join(" ")
    };
};

const parseNotes = (notes: string) => {
    const information = {
        userStory: null,
        task: null,
        bug: null,
        finished: false
    } as NoteInformation;

    const decoded = decodeHTML(notes);
    const lines = splitLines(decoded);
    
    const userStory = findPrefixInLines(lines, prefixes.userStory);
    if (userStory !== null) {
        information.userStory = splitIdAndName(userStory);
    }

    const task = findPrefixInLines(lines, prefixes.task);
    if (task !== null) {
        information.task = splitIdAndName(task);
    }

    const bug = findPrefixInLines(lines, prefixes.bug);
    if (bug !== null) {
        information.bug = splitIdAndName(bug);
    }

    // finished doesn't have anything after the prefix so compare with ''
    const finished = findPrefixInLines(lines, prefixes.finished);
    if (finished === '') {
        information.finished = true;
    }

    return information;
};

const getPrefix = (entity: any) => {
    if (entity.ResourceType === "UserStory") {
        return prefixes.userStory;
    }

    if (entity.ResourceType === "Bug") {
        return prefixes.bug;
    }

    if (entity.ResourceType === "Task") {
        return prefixes.task;
    }

    return `[UNRECOGNISED RESOURCE TYPE ${entity.ResourceType}`;
};

const createLine = (entity: any) => {
    const prefix = getPrefix(entity);
    
    return `${prefix}${entity.Id} ${entity.Name}`;
};

const createNotes = (entity: any, additionalNotes?: string) => {
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

export { createNotes, parseNotes };
