import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { findLinesWithoutPrefix } from "../../src/harvest/helpers/notes-utilities.ts";

describe("findLinesWithoutPrefix", () => {
    it("parses lines without a prefix", () => {
        const lines = ["> user_story #12345 foo", "first line", "> task #18491 bar", "second line"];

        const result = findLinesWithoutPrefix(lines, ["> user_story #", "> task #"]);

        assert.deepStrictEqual(result, ["first line", "second line"]);
    });

    it("parses lines without a prefix when there are no such lines", () => {
        const lines = ["> user_story #12345 foo", "> task #18491 bar"];

        const result = findLinesWithoutPrefix(lines, ["> user_story #", "> task #"]);

        assert.deepStrictEqual(result, []);
    });
});
