import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { createNotes } from "../../src/harvest/helpers/create-notes.ts";
import { EntityType } from "../../src/target-process/models/tp-bookable-entity.ts";
import type { NoteMetadata } from "../../src/harvest/models/time-entry.ts";
import { NoteMetadataBuilder } from "../_builders/note-metadata.builder.ts";
import { EntityBuilder } from "../_builders/entity.builder.ts";

describe("createNotes", () => {
    it("creates notes correctly for a task", () => {
        const input: NoteMetadata = {
            tpBookableEntity: {
                ResourceType: EntityType.TASK,
                Id: 67890,
                Name: "Some Task Name",
                UserStory: {
                    Id: 12345,
                    Name: "Foo",
                    ResourceType: "UserStory",
                },
            },
            finished: false,
            version: "0.0.0",
        };

        const expected = ["*User story:* #12345 Foo", "*Task:* #67890 Some Task Name", "*Recorded by:* twotime 0.0.0"].join("\n");

        const res = createNotes(input);

        assert.deepStrictEqual(res, expected);
    });

    it("creates notes correctly for a bug", () => {
        const input: NoteMetadata = {
            tpBookableEntity: {
                ResourceType: EntityType.BUG,
                Id: 94123,
                Name: "A very very horrible bug",
                UserStory: {
                    Id: 17441,
                    Name: "User should be able to eat cheese",
                    ResourceType: "UserStory",
                },
            },
            finished: false,
            version: "0.0.0",
        };

        const expected = [
            "*User story:* #17441 User should be able to eat cheese",
            "*Bug:* #94123 A very very horrible bug",
            "*Recorded by:* twotime 0.0.0",
        ].join("\n");

        const res = createNotes(input);

        assert.deepStrictEqual(res, expected);
    });

    it("creates notes correctly without a user story", () => {
        const input: NoteMetadata = {
            tpBookableEntity: {
                ResourceType: EntityType.BUG,
                Id: 94123,
                Name: "A very very horrible bug",
            },
            finished: false,
            version: "0.0.0",
        };

        const expected = ["*Bug:* #94123 A very very horrible bug", "*Recorded by:* twotime 0.0.0"].join("\n");

        const res = createNotes(input);

        assert.deepStrictEqual(res, expected);
    });

    it("creates notes correctly for a finished entry", () => {
        const entity = new EntityBuilder().withType(EntityType.BUG).withId(94123).withName("A very very horrible bug").build();

        const input = new NoteMetadataBuilder().withEntity(entity).withFinished(true).build();

        const expected = ["*Bug:* #94123 A very very horrible bug", "*Status:* finished", "*Recorded by:* twotime 0.0.0"].join(
            "\n"
        );

        const res = createNotes(input);

        assert.deepStrictEqual(res, expected);
    });

    const additionalNotesCases: string[][] = [["bla bla additional"], ["some additional notes", "more"]];

    for (const additional of additionalNotesCases) {
        it(`displays additional notes correctly: ${JSON.stringify(additional)}`, () => {
            const input: NoteMetadata = {
                tpBookableEntity: {
                    ResourceType: EntityType.BUG,
                    Id: 94123,
                    Name: "A very very horrible bug",
                },
                finished: false,
                version: "0.0.0",
            };

            const expected = ["*Bug:* #94123 A very very horrible bug", "*Recorded by:* twotime 0.0.0", ...additional].join("\n");

            const res = createNotes(input, additional);

            assert.deepStrictEqual(res, expected);
        });
    }

    const noMetadataCases: string[][] = [["Some note here"], ["this is", "a note", "i like it"]];

    for (const notes of noMetadataCases) {
        it(`displays notes correctly if there is no metadata: ${JSON.stringify(notes)}`, () => {
            const expected = notes.join("\n");

            const res = createNotes(null, notes);

            assert.deepStrictEqual(res, expected);
        });
    }
});
