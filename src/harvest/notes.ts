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

interface Prefix {
    text: string;
    setValue: (info: NoteInformation, value: Entity | null) => void;
}

const entityPrefixes = [
    { text: "> user_story #", setValue: (info, value) => info.userStory = value },
    { text: "> task #", setValue: (info, value) => info.task = value },
    { text: "> bug #", setValue: (info, value) => info.bug = value }
] as Prefix[];

const splitLines = (str: string) => str.match(/[^\r\n]+/g);

const parseEntity = (prefix: Prefix, line: string, information: NoteInformation) => {
    if (line.indexOf(prefix.text) !== 0) {
        prefix.setValue(information, null);
    }

    const withoutPrefix = line.substring(prefix.text.length);
    const parts = withoutPrefix.split(" ");

    prefix.setValue(information, {
        id: parseInt(parts[0]),
        name: parts.slice(1).join(" ")
    });
};

const parseNotes = (notes: string) => {
    const lines = splitLines(notes);
    const information = {
        userStory: null,
        task: null,
        bug: null,
        finished: null
    } as NoteInformation;

    lines.forEach(line => {
        entityPrefixes.forEach(prefix => parseEntity(prefix, line, information));
    });

    return information;
};

export { parseNotes };
