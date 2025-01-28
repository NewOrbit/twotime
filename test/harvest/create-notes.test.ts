import { TestFixture, TestCase, Test, Expect } from "alsatian";
import { createNotes } from "../../src/harvest/helpers/create-notes";
import { EntityType } from "../../src/target-process/models/tp-bookable-entity";
import { NoteMetadata } from "../../src/harvest/models/time-entry";
import { NoteMetadataBuilder } from "../_builders/note-metadata.builder";
import { EntityBuilder } from "../_builders/entity.builder";

@TestFixture()
export class CreateNotesTests {

    @Test()
    public shouldCreateNotesCorrectlyForTask() {
        const input: NoteMetadata = {
            tpBookableEntity: {
                ResourceType: EntityType.TASK,
                Id: 67890,
                Name: "Some Task Name",
                UserStory: {
                    Id: 12345,
                    Name: "Foo",
                    ResourceType: "UserStory"
                },
            },
            finished: false,
            version: "0.0.0"
        };

        const expected = "*User story:* #12345 Foo\n"
            + "*Task:* #67890 Some Task Name\n"
            + "*Recorded by:* twotime 0.0.0";

        const res = createNotes(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldCreateNotesCorrectlyForBug() {
        const input: NoteMetadata = {
            tpBookableEntity: {
                ResourceType: EntityType.BUG,
                Id: 94123,
                Name: "A very very horrible bug",
                UserStory: {
                    Id: 17441,
                    Name: "User should be able to eat cheese",
                    ResourceType: "UserStory"
                },
            },
            finished: false,
            version: "0.0.0"
        };

        const expected = "*User story:* #17441 User should be able to eat cheese\n"
            + "*Bug:* #94123 A very very horrible bug\n"
            + "*Recorded by:* twotime 0.0.0";

        const res = createNotes(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldCreateNotesCorrectlyWithoutUserStory() {
        const input: NoteMetadata = {
            tpBookableEntity: {
                ResourceType: EntityType.BUG,
                Id: 94123,
                Name: "A very very horrible bug"
            },
            finished: false,
            version: "0.0.0"
        };

        const expected = "*Bug:* #94123 A very very horrible bug\n"
            + "*Recorded by:* twotime 0.0.0";

        const res = createNotes(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldCreateNotesCorrectlyForFinished() {
        const entity = new EntityBuilder()
            .withType(EntityType.BUG)
            .withId(94123)
            .withName("A very very horrible bug")
            .build();

        const input = new NoteMetadataBuilder()
            .withEntity(entity)
            .withFinished(true)
            .build();

        const expected = "*Bug:* #94123 A very very horrible bug\n"
            + "*Status:* finished\n"
            + "*Recorded by:* twotime 0.0.0";

        const res = createNotes(input);

        Expect(res).toEqual(expected);
    }

    @TestCase(["bla bla additional"])
    @TestCase(["some additional notes", "more"])
    public shouldDisplayAdditionalNotesCorrectly(additional: string[]) {
        const input: NoteMetadata = {
            tpBookableEntity: {
                ResourceType: EntityType.BUG,
                Id: 94123,
                Name: "A very very horrible bug"
            },
            finished: false,
            version: "0.0.0"
        };

        const expected = "*Bug:* #94123 A very very horrible bug\n"
            + "*Recorded by:* twotime 0.0.0\n"
            + additional.join("\n");

        const res = createNotes(input, additional);

        Expect(res).toEqual(expected);
    }

    @TestCase(["Some note here"])
    @TestCase(["this is", "a note", "i like it"])
    public shouldDisplayNotesCorrectlyIfNoMetadata(notes: string[]) {
        const expected = notes.join("\n");

        const res = createNotes(null, notes);

        Expect(res).toEqual(expected);
    }

}
