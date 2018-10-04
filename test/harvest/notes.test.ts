import { TestFixture, TestCase, Test, Expect } from "alsatian";
import { parseNotes, createNotes } from "../../src/harvest/notes";

@TestFixture()
export class NotesTests {
    
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
            bug: {
                id: 40732,
                name: "v8.13 - FK AdditionalApplicationAnswers"
            },
            task: null,
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
            bug: {
                id: 40732,
                name: "v8.13 - FK AdditionalApplicationAnswers"
            },
            task: null,
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
            bug: {
                id: 40732,
                name: "v8.13 - FK AdditionalApplicationAnswers"
            },
            task: null,
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
            bug: null,
            task: {
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
            bug: null,
            task: {
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
            bug: null,
            task: {
                id: 12345,
                name: "Foo! Bar"
            },
            finished: false
        };

        const res = parseNotes(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldCreateNotesCorrectlyForTask() {
        const input = {
            ResourceType: "Task",
            Id: 67890,
            Name: "Some Task Name",
            UserStory: {
                ResourceType: "UserStory",
                Id: 12345,
                Name: "Foo"
            }
        };

        const expected = "> user_story #12345 Foo\n"
            + "> task #67890 Some Task Name";

        const res = createNotes(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldCreateNotesCorrectlyForBug() {
        const input = {
            ResourceType: "Bug",
            Id: 94123,
            Name: "A very very horrible bug",
            UserStory: {
                ResourceType: "UserStory",
                Id: 17441,
                Name: "User should be able to eat cheese"
            }
        };

        const expected = "> user_story #17441 User should be able to eat cheese\n"
            + "> bug #94123 A very very horrible bug";

        const res = createNotes(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldCreateNotesCorrectlyWithoutUserStory() {
        const input = {
            ResourceType: "Bug",
            Id: 94123,
            Name: "A very very horrible bug",
            UserStory: null
        };

        const expected = "> bug #94123 A very very horrible bug";

        const res = createNotes(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldReturnEmptyStringForNullEntity() {
        const input = null;

        const expected = "";

        const res = createNotes(input);

        Expect(res).toEqual(expected);
    }

    @TestCase("bla bla additional")
    @TestCase("some additional notes")
    public shouldDisplayAdditionalNotesCorrectly(additional: string) {
        const entity = {
            ResourceType: "Bug",
            Id: 94123,
            Name: "A very very horrible bug",
            UserStory: null
        };

        const expected = "> bug #94123 A very very horrible bug\n"
            + additional;

        const res = createNotes(entity, additional);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldNotDisplayAdditionalNotesIfEmptyString() {
        const entity = {
            ResourceType: "Bug",
            Id: 94123,
            Name: "A very very horrible bug",
            UserStory: null
        };

        const expected = "> bug #94123 A very very horrible bug";

        const res = createNotes(entity, "");

        Expect(res).toEqual(expected);
    }

}
