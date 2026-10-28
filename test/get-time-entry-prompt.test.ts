import { describe, it } from "node:test";
import assert from "node:assert/strict";

import type { HarvestTimeEntry } from "../src/harvest/models/time-entry.ts";
import { EntityType } from "../src/target-process/models/tp-bookable-entity.ts";
import { getTimeEntryPrompt } from "../src/utils/get-time-entry-prompt.ts";

import { EntityBuilder } from "./_builders/entity.builder.ts";
import { NoteMetadataBuilder } from "./_builders/note-metadata.builder.ts";

describe("getTimeEntryPrompt", () => {
    const entityCases: [entityId: number, entityName: string, hours: number, entityType: EntityType, expectedPrompt: string][] = [
        [123, "Foo", 0, EntityType.BUG, "0.00 hours - Foo (Bug #123)"],
        [456, "Bar", 1.2, EntityType.TASK, "1.20 hours - Bar (Task #456)"],
        [48337, "Bla bla this is a bug", 1.748, EntityType.BUG, "1.75 hours - Bla bla this is a bug (Bug #48337)"],
    ];

    for (const [entityId, entityName, hours, entityType, expectedPrompt] of entityCases) {
        it(`returns "${expectedPrompt}"`, () => {
            const entity = new EntityBuilder().withId(entityId).withName(entityName).withType(entityType).build();

            const entry: HarvestTimeEntry = {
                id: 123,
                metadata: new NoteMetadataBuilder().withEntity(entity).build(),
                hours,
                notes: [],
                created: "2017-06-26T22:32:52Z",
                running: false,
            };

            const expected = {
                value: entry,
                name: expectedPrompt,
            };

            const result = getTimeEntryPrompt(entry);

            assert.deepStrictEqual(result, expected);
        });
    }

    const nullMetadataCases: [notes: string[], hours: number, expectedPrompt: string][] = [
        [["foo", "barr"], 1.0, "1.00 hours - foo (no tp entity)"],
        [["a longer line with some more info"], 1.78, "1.78 hours - a longer line with some more info (no tp entity)"],
        [[], 1.78, "1.78 hours - no notes provided (no tp entity)"],
        [[], 2.55, "2.55 hours - no notes provided (no tp entity)"],
    ];

    for (const [notes, hours, expectedPrompt] of nullMetadataCases) {
        it(`returns "${expectedPrompt}" when metadata is null`, () => {
            const entry: HarvestTimeEntry = {
                id: 123,
                metadata: null,
                hours,
                notes,
                created: "2017-06-26T22:32:52Z",
                running: false,
            };

            const expected = {
                value: entry,
                name: expectedPrompt,
            };

            const result = getTimeEntryPrompt(entry);

            assert.deepStrictEqual(result, expected);
        });
    }
});
