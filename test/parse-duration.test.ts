import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { parseDuration } from "../src/utils/parse-duration.ts";

describe("parseDuration", () => {

    const validCases: [input: string, expectedHours: number, expectedMinutes: number][] = [
        [":10", 0, 10],
        ["1:06", 1, 6],
        ["4:22", 4, 22],
        ["17:08", 17, 8]
    ];

    for (const [input, expectedHours, expectedMinutes] of validCases) {
        it(`parses "${input}" as ${expectedHours}h ${expectedMinutes}m`, () => {
            const expected = {
                hours: expectedHours,
                minutes: expectedMinutes
            };

            const result = parseDuration(input);

            assert.deepStrictEqual(result, expected);
        });
    }

    for (const input of ["01:", "14", "xx"]) {
        it(`returns null for bad input "${input}"`, () => {
            const result = parseDuration(input);

            assert.deepStrictEqual(result, null);
        });
    }

});
