import { TestFixture, Test, Expect } from "alsatian";
import { findLinesWithoutPrefix } from "../../src/harvest/helpers/notes-utilities";

@TestFixture()
export class FindLinesWithoutPrefixTests {

    @Test()
    public shouldParseLinesWithoutPrefix() {
        const input = "> user_story #12345 foo\n"
            + "first line\n"
            + "> task #18491 bar\n"
            + "second line";

        const lines = input.split("\n");

        const result = findLinesWithoutPrefix(lines, [ "> user_story #", "> task #"]);

        Expect(result).toEqual(["first line", "second line"]);
    }

    @Test()
    public shouldParseLinesWithoutPrefixWhenNoLines() {
        const input = "> user_story #12345 foo\n"
            + "> task #18491 bar";

        const lines = input.split("\n");

        const result = findLinesWithoutPrefix(lines, [ "> user_story #", "> task #"]);

        Expect(result).toEqual([]);
    }

}
