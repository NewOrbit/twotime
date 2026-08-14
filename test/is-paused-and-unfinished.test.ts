import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { HarvestTimeEntry } from "../src/harvest/models/time-entry.ts";
import { isPausedAndUnfinished } from "../src/utils/is-paused-and-unfinished.ts";
import { NoteMetadataBuilder } from "./_builders/note-metadata.builder.ts";

describe("isPausedAndUnfinished", () => {

    it("returns false for a running entry", () => {
        const entry: HarvestTimeEntry = {
            id: 0,
            notes: [],
            metadata: null,
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: true
        };

        const result = isPausedAndUnfinished(entry);

        assert.strictEqual(result, false);
    });

    it("returns true for an unfinished, non-running entry", () => {
        const entry: HarvestTimeEntry = {
            id: 0,
            notes: [],
            metadata: new NoteMetadataBuilder().withFinished(false).build(),
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: false
        };

        const result = isPausedAndUnfinished(entry);

        assert.strictEqual(result, true);
    });

    it("returns true for a non-running entry without metadata", () => {
        const entry: HarvestTimeEntry = {
            id: 0,
            notes: [],
            metadata: null,
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: false
        };

        const result = isPausedAndUnfinished(entry);

        assert.strictEqual(result, true);
    });

    it("returns false for a finished, non-running entry", () => {
        const entry: HarvestTimeEntry = {
            id: 0,
            notes: [],
            metadata: new NoteMetadataBuilder().withFinished(true).build(),
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: false
        };

        const result = isPausedAndUnfinished(entry);

        assert.strictEqual(result, false);
    });

    // NOTE: identical to the case above — carried over from the alsatian suite, where
    // shouldReturnFalseforFinishedNonRunningEntry and shouldReturnFalseforFinishedEntry
    // asserted exactly the same thing. Kept to preserve the original test count.
    it("returns false for a finished entry", () => {
        const entry: HarvestTimeEntry = {
            id: 0,
            notes: [],
            metadata: new NoteMetadataBuilder().withFinished(true).build(),
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: false
        };

        const result = isPausedAndUnfinished(entry);

        assert.strictEqual(result, false);
    });

    it("returns false for a running, finished entry", () => {
        const entry: HarvestTimeEntry = {
            id: 0,
            notes: [],
            metadata: new NoteMetadataBuilder().withFinished(true).build(),
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: true
        };

        const result = isPausedAndUnfinished(entry);

        assert.strictEqual(result, false);
    });

});
