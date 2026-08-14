import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { startArrayAt } from "../src/utils/start-array-at.ts";

describe("startArrayAt", () => {

    const cases: [input: unknown[], target: number, expected: unknown[]][] = [
        [[0, 1, 2, 3], 2, [2, 3, 0, 1]],
        [[0, 1, 2, 3], 1, [1, 2, 3, 0]],
        [["foo", "bar", "baz"], 1, ["bar", "baz", "foo"]],
        [[true, false, false, true], 1, [false, false, true, true]]
    ];

    for (const [input, target, expected] of cases) {
        it(`orders [${input}] from index ${target} correctly`, () => {
            const result = startArrayAt(input, target);

            assert.deepStrictEqual(result, expected);
        });
    }

});
