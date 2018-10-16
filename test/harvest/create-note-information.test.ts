import { TestFixture, TestCase, Test, Expect } from "alsatian";
import { createNoteInformation } from "../../src/harvest/notes/create-note-information";
import { NoteInformation, EntityType } from "../../src/harvest/notes/note-information";

@TestFixture()
export class CreateNoteInformationTests {
    
    @Test()
    public shouldCreateNoteInformationCorrectlyForTask() {
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

        const expected: NoteInformation = {
            userStory: {
                id: 12345,
                name: "Foo"
            },
            entity: {
                type: EntityType.TASK,
                id: 67890,
                name: "Some Task Name"
            },
            finished: false,
            additionalNotes: []
        };

        const res = createNoteInformation(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldCreateNoteInformationCorrectlyForBug() {
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

        const expected: NoteInformation = {
            userStory: {
                id: 17441,
                name: "User should be able to eat cheese"
            },
            entity: {
                type: EntityType.BUG,
                id: 94123,
                name: "A very very horrible bug"
            },
            finished: false,
            additionalNotes: []
        };

        const res = createNoteInformation(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldCreateNoteInformationCorrectlyWithoutUserStory() {
        const input = {
            ResourceType: "Bug",
            Id: 94123,
            Name: "A very very horrible bug",
            UserStory: null
        };

        const expected: NoteInformation = {
            userStory: null,
            entity: {
                type: EntityType.BUG,
                id: 94123,
                name: "A very very horrible bug"
            },
            finished: false,
            additionalNotes: []
        };

        const res = createNoteInformation(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldReturnNullForNullEntity() {
        const input = null;

        const expected = null;

        const res = createNoteInformation(input);

        Expect(res).toEqual(expected);
    }

}
