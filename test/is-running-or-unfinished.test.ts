import { describe, it } from "node:test";
import assert from "node:assert/strict";

import type { HarvestTimeEntry } from "../src/harvest/models/time-entry.ts";
import { isRunningOrUnfinished } from "../src/utils/is-running-or-unfinished.ts";

import { NoteMetadataBuilder } from "./_builders/note-metadata.builder.ts";

describe("isRunningOrUnfinished", () => {

    it("returns true for a running entry", () => {
        const entry: HarvestTimeEntry = {
            id: 0,
            notes: [],
            metadata: null,
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: true
        };

        const result = isRunningOrUnfinished(entry);

        assert.strictEqual(result, true);
    });

    it("returns true for an unfinished entry", () => {
        const entry: HarvestTimeEntry = {
            id: 0,
            notes: [],
            metadata: new NoteMetadataBuilder().withFinished(false).build(),
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: false
        };

        const result = isRunningOrUnfinished(entry);

        assert.strictEqual(result, true);
    });

    it("returns false for a finished entry", () => {
        const entry: HarvestTimeEntry = {
            id: 0,
            notes: [],
            metadata: new NoteMetadataBuilder().withFinished(true).build(),
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: false
        };

        const result = isRunningOrUnfinished(entry);

        assert.strictEqual(result, false);
    });

    it("returns true for a running, finished entry", () => {
        const entry: HarvestTimeEntry = {
            id: 0,
            notes: [],
            metadata: new NoteMetadataBuilder().withFinished(true).build(),
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: true
        };

        const result = isRunningOrUnfinished(entry);

        assert.strictEqual(result, true);
    });

});
