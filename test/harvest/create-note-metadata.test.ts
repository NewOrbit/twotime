import { TestFixture, TestCase, Test, Expect } from "alsatian";
import { createNoteMetadata } from "../../src/harvest/notes/create-note-metadata";
import { NoteMetadata, EntityType } from "../../src/harvest/notes/note-metadata";

@TestFixture()
export class CreateNoteMetadataTests {

    @Test()
    public shouldCreateNoteMetadataCorrectlyForTask() {
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

        const expected: NoteMetadata = {
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
            version: "0.0.0"
        };

        const res = createNoteMetadata(input, "0.0.0");

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldCreateNoteMetadataCorrectlyForBug() {
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

        const expected: NoteMetadata = {
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
            version: "0.0.0"
        };

        const res = createNoteMetadata(input, "0.0.0");

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldCreateNoteMetadataCorrectlyWithoutUserStory() {
        const input = {
            ResourceType: "Bug",
            Id: 94123,
            Name: "A very very horrible bug",
            UserStory: null
        };

        const expected: NoteMetadata = {
            userStory: null,
            entity: {
                type: EntityType.BUG,
                id: 94123,
                name: "A very very horrible bug"
            },
            finished: false,
            version: "0.0.0"
        };

        const res = createNoteMetadata(input, "0.0.0");

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldCreateNoteMetadataCorrectlyForNullEntity() {
        const input = null;

        const expected = null;

        const res = createNoteMetadata(input, "0.0.0");

        Expect(res).toEqual(expected);
    }

    @TestCase("1.0.0")
    @TestCase("0.5.0")
    @TestCase("2.7.3")
    public shouldCreateNoteMetadataWithCorrectVersion(version: string) {
        const input = {
            ResourceType: "Bug",
            Id: 94123,
            Name: "A very very horrible bug",
            UserStory: null
        };

        const expected: NoteMetadata = {
            userStory: null,
            entity: {
                type: EntityType.BUG,
                id: 94123,
                name: "A very very horrible bug"
            },
            finished: false,
            version
        };

        const res = createNoteMetadata(input, version);

        Expect(res).toEqual(expected);
    }
}
