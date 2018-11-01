import { TestFixture, TestCase, Test, Expect } from "alsatian";
import { parseNotes } from "../../src/harvest/notes/parse-notes";
import { EntityType } from "../../src/harvest/notes/note-metadata";

@TestFixture()
export class ParseNotesTests {

    @Test()
    public shouldParseFinishedBugCorrectly() {
        const input = "&gt; user_story #35858 4.1	System Automatically Deletes all Previously Archived – Single Use Process\n"
            + "&gt; bug #40732 v8.13 - FK AdditionalApplicationAnswers\n"
            + "&gt; finished\n"
            + "&gt; twotime 0.0.0";

        const expected = {
            metadata: {
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
                version: "0.0.0"
            },
            additionalNotes: []
        };

        const res = parseNotes(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldParseUnfinishedBugCorrectly() {
        const input = "&gt; user_story #35858 4.1	System Automatically Deletes all Previously Archived – Single Use Process\n"
            + "&gt; bug #40732 v8.13 - FK AdditionalApplicationAnswers\n"
            + "&gt; twotime 0.0.0";

        const expected = {
            metadata: {
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
                version: "0.0.0"
            },
            additionalNotes: []
        };

        const res = parseNotes(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldParseUnfinishedBugCorrectlyForBadFinishedNote() {
        const input = "&gt; user_story #35858 4.1	System Automatically Deletes all Previously Archived – Single Use Process\n"
            + "&gt; bug #40732 v8.13 - FK AdditionalApplicationAnswers\n"
            + "&gt; finished but it's not the correct format!\n"
            + "&gt; twotime 0.0.0";

        const expected = {
            metadata: {
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
                version: "0.0.0"
            },
            additionalNotes: []
        };

        const res = parseNotes(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldParseFinishedTaskCorrectly() {
        const input = "&gt; user_story #35858 4.1	System Automatically Deletes all Previously Archived – Single Use Process\n"
            + "&gt; task #12345 Foo! Bar\n"
            + "&gt; finished\n"
            + "&gt; twotime 0.0.0";

        const expected = {
            metadata: {
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
                version: "0.0.0"
            },
            additionalNotes: []
        };

        const res = parseNotes(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldParseCorrectlyForUnescapedSymbol() {
        const input = "> user_story #35858 4.1	System Automatically Deletes all Previously Archived – Single Use Process\n"
            + "> task #12345 Foo! Bar\n"
            + "> finished\n"
            + "> twotime 0.0.0\n"
            + "some additional notes\n"
            + "and some more";

        const expected = {
            metadata: {
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
                version: "0.0.0"
            },
            additionalNotes: ["some additional notes", "and some more"]
        };

        const res = parseNotes(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldParseUnfinishedTaskCorrectlyForBadFinishedNote() {
        const input = "&gt; user_story #35858 4.1	System Automatically Deletes all Previously Archived – Single Use Process\n"
            + "&gt; task #12345 Foo! Bar\n"
            + "&gt; finished but it's not the correct format!\n"
            + "&gt; twotime 0.0.0";

        const expected = {
            metadata: {
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
                version: "0.0.0"
            },
            additionalNotes: []
        };

        const res = parseNotes(input);

        Expect(res).toEqual(expected);
    }

    @TestCase("Some extra notes")
    @TestCase("bla bla bla")
    @TestCase("it's true!")
    public shouldParseAdditionalNotesCorrectly(additionalNotes: string) {
        const input = "&gt; user_story #12345 Foo\n"
            + "&gt; task #67890 Bar\n"
            + "&gt; finished\n"
            + "&gt; twotime 0.0.0\n"
            + additionalNotes;

        const res = parseNotes(input);

        Expect(res.additionalNotes).toEqual([additionalNotes]);
    }

    @Test()
    public shouldParseAdditionalNotesWhenSplit() {
        const input = "&gt; user_story #12345 Foo\n"
            + "&gt; task #67890 Bar\n"
            + "this is the first initial part\n"
            + "&gt; finished\n"
            + "&gt; twotime 0.0.0\n"
            + "second initial parts";

        const res = parseNotes(input);

        Expect(res.additionalNotes).toEqual(["this is the first initial part", "second initial parts"]);
    }

    @TestCase("0.0.0")
    @TestCase("1.2.3")
    @TestCase("7.16.1")
    public shouldParseVersionCorrectly(version: string) {
        const input = "&gt; user_story #12345 Foo\n"
            + "&gt; task #67890 Bar\n"
            + "&gt; finished\n"
            + "&gt; twotime " + version;

        const res = parseNotes(input);

        Expect(res.metadata.version).toEqual(version);
    }

}
