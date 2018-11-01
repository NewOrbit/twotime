import { TestFixture, TestCase, Test, Expect } from "alsatian";
import { createNotes } from "../../src/harvest/notes/create-notes";
import { NoteMetadata, EntityType } from "../../src/harvest/notes/note-metadata";
import { NoteMetadataBuilder } from "../_builders/note-metadata.builder";
import { EntityBuilder } from "../_builders/entity.builder";

@TestFixture()
export class CreateNotesTests {

    @Test()
    public shouldCreateNotesCorrectlyForTask() {
        const input: NoteMetadata = {
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

        const expected = "> user_story #12345 Foo\n"
            + "> task #67890 Some Task Name\n"
            + "> twotime 0.0.0";

        const res = createNotes(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldCreateNotesCorrectlyForBug() {
        const input: NoteMetadata = {
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

        const expected = "> user_story #17441 User should be able to eat cheese\n"
            + "> bug #94123 A very very horrible bug\n"
            + "> twotime 0.0.0";

        const res = createNotes(input);

        Expect(res).toEqual(expected);
    }

    @Test()
    public shouldCreateNotesCorrectlyWithoutUserStory() {
        const input: NoteMetadata = {
            userStory: null,
            entity: {
                type: EntityType.BUG,
                id: 94123,
                name: "A very very horrible bug"
            },
            finished: false,
            version: "0.0.0"
        };

        const expected = "> bug #94123 A very very horrible bug\n"
            + "> twotime 0.0.0";

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
            .withUserStory(null)
            .withEntity(entity)
            .withFinished(true)
            .build();

        const expected = "> bug #94123 A very very horrible bug\n"
            + "> finished\n"
            + "> twotime 0.0.0";

        const res = createNotes(input);

        Expect(res).toEqual(expected);
    }

    @TestCase(["bla bla additional"])
    @TestCase(["some additional notes", "more"])
    public shouldDisplayAdditionalNotesCorrectly(additional: string[]) {
        const input: NoteMetadata = {
            userStory: null,
            entity: {
                type: EntityType.BUG,
                id: 94123,
                name: "A very very horrible bug"
            },
            finished: false,
            version: "0.0.0"
        };

        const expected = "> bug #94123 A very very horrible bug\n"
            + "> twotime 0.0.0\n"
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
