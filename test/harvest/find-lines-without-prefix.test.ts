import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { findLinesWithoutPrefix } from "../../src/harvest/helpers/notes-utilities.ts";

describe("findLinesWithoutPrefix", () => {

    it("parses lines without a prefix", () => {
        const input = "> user_story #12345 foo\n"
            + "first line\n"
            + "> task #18491 bar\n"
            + "second line";

        const lines = input.split("\n");

        const result = findLinesWithoutPrefix(lines, [ "> user_story #", "> task #"]);

        assert.deepStrictEqual(result, ["first line", "second line"]);
    });

    it("parses lines without a prefix when there are no such lines", () => {
        const input = "> user_story #12345 foo\n"
            + "> task #18491 bar";

        const lines = input.split("\n");

        const result = findLinesWithoutPrefix(lines, [ "> user_story #", "> task #"]);

        assert.deepStrictEqual(result, []);
    });

});
