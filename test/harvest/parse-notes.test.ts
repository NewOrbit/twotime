import { TestFixture, TestCase, Test, Expect } from "alsatian";
import { parseNotes } from "../../src/harvest/notes/parse-notes";
import { EntityType } from "../../src/harvest/notes/note-information";

@TestFixture()
export class ParseNotesTests {
    
    @Test()
    public shouldParseFinishedBugCorrectly() {
        const input = "> user_story #35858 4.1	System Automatically Deletes all Previously Archived – Single Use Process\n"
            + "> bug #40732 v8.13 - FK AdditionalApplicationAnswers\n"
            + "> finished";

        const expected = {
            userStory: {
                id: 35858,
                name: "4.1	System Automatically Deletes all Previously Archived – Single Use Process"
            },
            entity: {
                type: EntityType.BUG,
                id: 40732,
                name: "v8.13 - FK AdditionalApplicationAnswers"
            },
            finished: true
        };

        const res = parseNotes(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldParseUnfinishedBugCorrectly() {
        const input = "> user_story #35858 4.1	System Automatically Deletes all Previously Archived – Single Use Process\n"
            + "> bug #40732 v8.13 - FK AdditionalApplicationAnswers\n";

        const expected = {
            userStory: {
                id: 35858,
                name: "4.1	System Automatically Deletes all Previously Archived – Single Use Process"
            },
            entity: {
                type: EntityType.BUG,
                id: 40732,
                name: "v8.13 - FK AdditionalApplicationAnswers"
            },
            finished: false
        };

        const res = parseNotes(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldParseUnfinishedBugCorrectlyForBadFinishedNote() {
        const input = "> user_story #35858 4.1	System Automatically Deletes all Previously Archived – Single Use Process\n"
            + "> bug #40732 v8.13 - FK AdditionalApplicationAnswers\n"
            + "> finished but it's not the correct format!";

        const expected = {
            userStory: {
                id: 35858,
                name: "4.1	System Automatically Deletes all Previously Archived – Single Use Process"
            },
            entity: {
                type: EntityType.BUG,
                id: 40732,
                name: "v8.13 - FK AdditionalApplicationAnswers"
            },
            finished: false
        };

        const res = parseNotes(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldParseFinishedTaskCorrectly() {
        const input = "> user_story #35858 4.1	System Automatically Deletes all Previously Archived – Single Use Process\n"
            + "> task #12345 Foo! Bar\n"
            + "> finished";

        const expected = {
            userStory: {
                id: 35858,
                name: "4.1	System Automatically Deletes all Previously Archived – Single Use Process"
            },
            entity: {
                type: EntityType.TASK,
                id: 12345,
                name: "Foo! Bar"
            },
            finished: true
        };

        const res = parseNotes(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldParseUnfinishedTaskCorrectly() {
        const input = "> user_story #35858 4.1	System Automatically Deletes all Previously Archived – Single Use Process\n"
            + "> task #12345 Foo! Bar\n";

        const expected = {
            userStory: {
                id: 35858,
                name: "4.1	System Automatically Deletes all Previously Archived – Single Use Process"
            },
            entity: {
                type: EntityType.TASK,
                id: 12345,
                name: "Foo! Bar"
            },
            finished: false
        };

        const res = parseNotes(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldParseUnfinishedTaskCorrectlyForBadFinishedNote() {
        const input = "> user_story #35858 4.1	System Automatically Deletes all Previously Archived – Single Use Process\n"
            + "> task #12345 Foo! Bar\n"
            + "> finished but it's not the correct format!";

        const expected = {
            userStory: {
                id: 35858,
                name: "4.1	System Automatically Deletes all Previously Archived – Single Use Process"
            },
            entity: {
                type: EntityType.TASK,
                id: 12345,
                name: "Foo! Bar"
            },
            finished: false
        };

        const res = parseNotes(input);

        Expect(res).toEqual(expected);
    }

}
