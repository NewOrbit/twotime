import { TestFixture, TestCase, Test, Expect } from "alsatian";
import { parseNotes, ParsedNotes } from "../../src/harvest/helpers/parse-notes";
import { EntityType } from "../../src/target-process/models/tp-bookable-entity";

@TestFixture()
export class ParseNotesTests {

    @Test()
    public shouldParseFinishedBugCorrectly() {
        const input = "*User story:* #35858 4.1	System Automatically Deletes all Previously Archived – Single Use Process\n"
            + "*Bug:* #40732 v8.13 - FK AdditionalApplicationAnswers\n"
            + "*Status:* finished\n"
            + "*Recorded by:* twotime 0.0.0";

        const expected: ParsedNotes = {
            metadata: {
                tpBookableEntity: {
                    ResourceType: EntityType.BUG,
                    Id: 40732,
                    Name: "v8.13 - FK AdditionalApplicationAnswers",
                    UserStory: {
                        Id: 35858,
                        Name: "4.1	System Automatically Deletes all Previously Archived – Single Use Process",
                        ResourceType: "UserStory"
                    }
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
        const input = "*User story:* #35858 4.1	System Automatically Deletes all Previously Archived – Single Use Process\n"
            + "*Bug:* #40732 v8.13 - FK AdditionalApplicationAnswers\n"
            + "*Recorded by:* twotime 0.0.0";

        const expected: ParsedNotes = {
            metadata: {
                tpBookableEntity: {
                    ResourceType: EntityType.BUG,
                    Id: 40732,
                    Name: "v8.13 - FK AdditionalApplicationAnswers",
                    UserStory: {
                        Id: 35858,
                        Name: "4.1	System Automatically Deletes all Previously Archived – Single Use Process",
                        ResourceType: "UserStory"
                    }
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
        const input = "*User story:* #35858 4.1	System Automatically Deletes all Previously Archived – Single Use Process\n"
            + "*Bug:* #40732 v8.13 - FK AdditionalApplicationAnswers\n"
            + "*Status:* finished but it's not the correct format!\n"
            + "*Recorded by:* twotime 0.0.0";

        const expected: ParsedNotes = {
            metadata: {
                tpBookableEntity: {
                    ResourceType: EntityType.BUG,
                    Id: 40732,
                    Name: "v8.13 - FK AdditionalApplicationAnswers",
                    UserStory: {
                        Id: 35858,
                        Name: "4.1	System Automatically Deletes all Previously Archived – Single Use Process",
                        ResourceType: "UserStory"
                    }
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
        const input = "*User story:* #35858 4.1	System Automatically Deletes all Previously Archived – Single Use Process\n"
            + "*Task:* #12345 Foo! Bar\n"
            + "*Status:* finished\n"
            + "*Recorded by:* twotime 0.0.0";

        const expected: ParsedNotes = {
            metadata: {
                tpBookableEntity: {
                    ResourceType: EntityType.TASK,
                    Id: 12345,
                    Name: "Foo! Bar",
                    UserStory: {
                        Id: 35858,
                        Name: "4.1	System Automatically Deletes all Previously Archived – Single Use Process",
                        ResourceType: "UserStory"
                    }
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
        const input = "*User story:* #35858 4.1	System Automatically Deletes all Previously Archived – Single Use Process\n"
            + "*Task:* #12345 Foo! Bar\n"
            + "*Status:* finished\n"
            + "*Recorded by:* twotime 0.0.0\n"
            + "some additional notes\n"
            + "and some more";

        const expected: ParsedNotes = {
            metadata: {
                tpBookableEntity: {
                    ResourceType: EntityType.TASK,
                    Id: 12345,
                    Name: "Foo! Bar",
                    UserStory: {
                        Id: 35858,
                        Name: "4.1	System Automatically Deletes all Previously Archived – Single Use Process",
                        ResourceType: "UserStory"
                    }
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
        const input = "*User story:* #35858 4.1	System Automatically Deletes all Previously Archived – Single Use Process\n"
            + "*Task:* #12345 Foo! Bar\n"
            + "*Status:* finished but it's not the correct format!\n"
            + "*Recorded by:* twotime 0.0.0";

        const expected = {
            metadata: {
                tpBookableEntity: {
                    ResourceType: EntityType.TASK,
                    Id: 12345,
                    Name: "Foo! Bar",
                    UserStory: {
                        Id: 35858,
                        Name: "4.1	System Automatically Deletes all Previously Archived – Single Use Process",
                        ResourceType: "UserStory"
                    }
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
        const input = "*User story:* #12345 Foo\n"
            + "*Task:* #67890 Bar\n"
            + "*Status:* finished\n"
            + "*Recorded by:* twotime 0.0.0\n"
            + additionalNotes;

        const res = parseNotes(input);

        Expect(res.additionalNotes).toEqual([additionalNotes]);
    }

    @Test()
    public shouldParseAdditionalNotesWhenSplit() {
        const input = "*User story:* #12345 Foo\n"
            + "*Task:* #67890 Bar\n"
            + "this is the first initial part\n"
            + "*Status:* finished\n"
            + "*Recorded by:* twotime 0.0.0\n"
            + "second initial parts";

        const res = parseNotes(input);

        Expect(res.additionalNotes).toEqual(["this is the first initial part", "second initial parts"]);
    }

    @TestCase("0.0.0")
    @TestCase("1.2.3")
    @TestCase("7.16.1")
    public shouldParseVersionCorrectly(version: string) {
        const input = "*User story:* #12345 Foo\n"
            + "*Task:* #67890 Bar\n"
            + "*Status:* finished\n"
            + "*Recorded by:* twotime " + version;

        const res = parseNotes(input);

        Expect(res.metadata?.version).toEqual(version);
    }

}
