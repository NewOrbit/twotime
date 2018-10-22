import { TestFixture, TestCase, Expect } from "alsatian";
import { findPrefixInLines } from "../../src/harvest/notes/parse-prefix";

@TestFixture()
export class FindPrefixInLinesTests {

    @TestCase([
        "> a somevalue",
        "anothervalue",
        "> apple oranges pears"
    ], "> apple ", "oranges pears")
    @TestCase([
        "& bla bla bla",
        "&& bla foo foo",
        "#john smith"
    ], "& bla ", "bla bla")
    @TestCase([
        "> user_story #12345 foo",
        "> task #18273 this is a task",
        "> finished"
    ], "> user_story #", "12345 foo")
    @TestCase([
        "> user_story #12345 foo",
        "> task #18273 this is a task",
        "> finished"
    ], "> finished", "")
    @TestCase([
        "@ 1234",
        "### 198318",
        "~~~ +-123",
        "$&$!*"
    ], "> finished", null)
    public shouldParsePrefixCorrectly(lines: string[], prefix: string, expected: string) {
        const result = findPrefixInLines(lines, prefix);

        Expect(result).toEqual(expected);
    }

}
