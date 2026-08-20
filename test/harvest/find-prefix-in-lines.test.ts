import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { findPrefixInLines } from "../../src/harvest/helpers/notes-utilities.ts";

describe("findPrefixInLines", () => {

    // the empty string is a valid outcome, so "not found" is signalled by null
    const cases: [lines: string[], prefix: string, expected: string | null][] = [
        [[
            "> a somevalue",
            "anothervalue",
            "> apple oranges pears"
        ], "> apple ", "oranges pears"],
        [[
            "& bla bla bla",
            "&& bla foo foo",
            "#john smith"
        ], "& bla ", "bla bla"],
        [[
            "> user_story #12345 foo",
            "> task #18273 this is a task",
            "> finished"
        ], "> user_story #", "12345 foo"],
        [[
            "> user_story #12345 foo",
            "> task #18273 this is a task",
            "> finished"
        ], "> finished", ""],
        [[
            "@ 1234",
            "### 198318",
            "~~~ +-123",
            "$&$!*"
        ], "> finished", null]
    ];

    for (const [lines, prefix, expected] of cases) {
        it(`finds ${JSON.stringify(expected)} for prefix "${prefix}"`, () => {
            const result = findPrefixInLines(lines, prefix);

            assert.deepStrictEqual(result, expected);
        });
    }

});
