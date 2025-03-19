import { TestFixture, TestCase, Test, Expect } from "alsatian";
import { createNoteMetadata } from "../../src/harvest/helpers/create-notes";
import { NoteMetadata } from "../../src/harvest/models/time-entry";
import { EntityType, TpBookableEntity } from "../../src/target-process/models/tp-bookable-entity";

@TestFixture()
export class CreateNoteMetadataTests {

    @Test()
    public shouldCreateNoteMetadataCorrectlyForTask() {
        const input: TpBookableEntity = {
            ResourceType: EntityType.TASK,
            Id: 67890,
            Name: "Some Task Name",
            UserStory: {
                ResourceType: "UserStory",
                Id: 12345,
                Name: "Foo"
            }
        };

        const expected: NoteMetadata = {
            tpBookableEntity: input,
            finished: false,
            version: "0.0.0"
        };

        const res = createNoteMetadata(input, "0.0.0");

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldCreateNoteMetadataCorrectlyForBug() {
        const input: TpBookableEntity = {
            ResourceType: EntityType.BUG,
            Id: 94123,
            Name: "A very very horrible bug",
            UserStory: {
                ResourceType: "UserStory",
                Id: 17441,
                Name: "User should be able to eat cheese"
            }
        };

        const expected: NoteMetadata = {
            tpBookableEntity: input,
            finished: false,
            version: "0.0.0"
        };

        const res = createNoteMetadata(input, "0.0.0");

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldCreateNoteMetadataCorrectlyWithoutUserStory() {
        const input: TpBookableEntity = {
            ResourceType: EntityType.BUG,
            Id: 94123,
            Name: "A very very horrible bug",
            UserStory: undefined
        };

        const expected: NoteMetadata = {
            tpBookableEntity: input,
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
        const input: TpBookableEntity = {
            ResourceType: EntityType.BUG,
            Id: 94123,
            Name: "A very very horrible bug",
            UserStory: undefined
        };

        const expected: NoteMetadata = {
            tpBookableEntity: input,
            finished: false,
            version
        };

        const res = createNoteMetadata(input, version);

        Expect(res).toEqual(expected);
    }
}
