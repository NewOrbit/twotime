import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";

import { list } from "../src/commands/list.ts";
import type { ApiProvider } from "../src/api-provider.ts";
import type { HarvestTimeEntry } from "../src/harvest/models/time-entry.ts";

const makeEntry = (overrides: Partial<HarvestTimeEntry>): HarvestTimeEntry => ({
    id: 0,
    notes: [],
    metadata: null,
    hours: 1,
    created: "2017-06-26T22:32:52Z",
    running: false,
    ...overrides
});

// list() only ever reaches for getHarvestApi().getTimeEntries(), so a structural stub
// is enough — and avoids constructing a real Configstore and HarvestApi.
const providerReturning = (entries: HarvestTimeEntry[]) =>
    ({ getHarvestApi: () => ({ getTimeEntries: async () => entries }) }) as unknown as ApiProvider;

const renderList = async (entries: HarvestTimeEntry[]) => {
    const lines: string[] = [];
    const spy = mock.method(console, "log", (message: string) => { lines.push(message); });

    try {
        await list(providerReturning(entries), "2017-06-26");
    } finally {
        spy.mock.restore();
    }

    return lines.join("\n");
};

// An entry with no metadata always renders "n/a" in the Entity Type column, so counting
// occurrences distinguishes "the Title column also fell back" from "it did not".
const countNotAvailable = (output: string) => output.split("n/a").length - 1;

describe("list", () => {

    it("falls back for an entry with no notes at all", async () => {
        const output = await renderList([makeEntry({ notes: [] })]);

        // both Entity Type and Title fall back
        assert.strictEqual(countNotAvailable(output), 2);
    });

    it("does not fall back for a note that is the empty string", async () => {
        const output = await renderList([makeEntry({ notes: [""] })]);

        // only Entity Type falls back; an empty note stays an empty cell
        assert.strictEqual(countNotAvailable(output), 1);
    });

    it("renders the first note as the title", async () => {
        const output = await renderList([makeEntry({ notes: ["first note", "second note"] })]);

        assert.match(output, /first note/);
        assert.doesNotMatch(output, /second note/);
        assert.strictEqual(countNotAvailable(output), 1);
    });

    it("renders hours to two decimal places and a total", async () => {
        const output = await renderList([
            makeEntry({ notes: ["a"], hours: 1.748 }),
            makeEntry({ notes: ["b"], hours: 2 })
        ]);

        assert.match(output, /1\.75/);
        assert.match(output, /2\.00/);
        assert.match(output, /Total: 3\.75/);
    });

    it("renders the running state per entry", async () => {
        const output = await renderList([
            makeEntry({ notes: ["a"], running: true }),
            makeEntry({ notes: ["b"], running: false })
        ]);

        assert.match(output, /running/);
        assert.match(output, /paused/);
    });

});
