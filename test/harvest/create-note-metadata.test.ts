import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { createNoteMetadata } from "../../src/harvest/helpers/create-notes.ts";
import type { NoteMetadata } from "../../src/harvest/models/time-entry.ts";
import type { TpBookableEntity } from "../../src/target-process/models/tp-bookable-entity.ts";
import { EntityType } from "../../src/target-process/models/tp-bookable-entity.ts";

describe("createNoteMetadata", () => {
    it("creates note metadata correctly for a task", () => {
        const input: TpBookableEntity = {
            ResourceType: EntityType.TASK,
            Id: 67890,
            Name: "Some Task Name",
            UserStory: {
                ResourceType: "UserStory",
                Id: 12345,
                Name: "Foo",
            },
        };

        const expected: NoteMetadata = {
            tpBookableEntity: input,
            finished: false,
            version: "0.0.0",
        };

        const res = createNoteMetadata(input, "0.0.0");

        assert.deepStrictEqual(res, expected);
    });

    it("creates note metadata correctly for a bug", () => {
        const input: TpBookableEntity = {
            ResourceType: EntityType.BUG,
            Id: 94123,
            Name: "A very very horrible bug",
            UserStory: {
                ResourceType: "UserStory",
                Id: 17441,
                Name: "User should be able to eat cheese",
            },
        };

        const expected: NoteMetadata = {
            tpBookableEntity: input,
            finished: false,
            version: "0.0.0",
        };

        const res = createNoteMetadata(input, "0.0.0");

        assert.deepStrictEqual(res, expected);
    });

    it("creates note metadata correctly without a user story", () => {
        const input: TpBookableEntity = {
            ResourceType: EntityType.BUG,
            Id: 94123,
            Name: "A very very horrible bug",
            UserStory: undefined,
        };

        const expected: NoteMetadata = {
            tpBookableEntity: input,
            finished: false,
            version: "0.0.0",
        };

        const res = createNoteMetadata(input, "0.0.0");

        assert.deepStrictEqual(res, expected);
    });

    it("creates note metadata correctly for a null entity", () => {
        const res = createNoteMetadata(null, "0.0.0");

        assert.deepStrictEqual(res, null);
    });

    for (const version of ["1.0.0", "0.5.0", "2.7.3"]) {
        it(`creates note metadata with version ${version}`, () => {
            const input: TpBookableEntity = {
                ResourceType: EntityType.BUG,
                Id: 94123,
                Name: "A very very horrible bug",
                UserStory: undefined,
            };

            const expected: NoteMetadata = {
                tpBookableEntity: input,
                finished: false,
                version,
            };

            const res = createNoteMetadata(input, version);

            assert.deepStrictEqual(res, expected);
        });
    }
});
