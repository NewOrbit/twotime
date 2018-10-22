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
            finished: true,
            additionalNotes: []
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
            finished: false,
            additionalNotes: []
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
            finished: false,
            additionalNotes: []
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
            finished: true,
            additionalNotes: []
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
            finished: false,
            additionalNotes: []
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
            finished: false,
            additionalNotes: []
        };

        const res = parseNotes(input);

        Expect(res).toEqual(expected);
    }

    @TestCase("Some extra notes")
    @TestCase("bla bla bla")
    @TestCase("it's true!")
    public shouldParseAdditionalNotesCorrectly(additionalNotes: string) {
        const input = "> user_story #12345 Foo\n"
            + "> task #67890 Bar\n"
            + "> finished\n"
            + additionalNotes;

        const res = parseNotes(input);

        Expect(res.additionalNotes).toEqual([ additionalNotes ]);
    }

    @Test()
    public shouldParseAdditionalNotesWhenSplit() {
        const input = "> user_story #12345 Foo\n"
            + "> task #67890 Bar\n"
            + "this is the first initial part\n"
            + "> finished\n"
            + "second initial parts";

        const res = parseNotes(input);

        Expect(res.additionalNotes).toEqual(["this is the first initial part", "second initial parts"]);
    }

}
