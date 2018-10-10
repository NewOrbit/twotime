import { TestFixture, TestCase, Test, Expect } from "alsatian";
import { createNotes } from "../../src/harvest/notes/create-notes";

@TestFixture()
export class CreateNotesTests {
    
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
