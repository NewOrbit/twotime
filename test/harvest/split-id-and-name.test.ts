import { TestFixture, TestCase, Expect } from "alsatian";
import { splitIdAndName } from "../../src/harvest/notes/split-id-and-name";

@TestFixture()
export class SplitIdAndNameTests {

    @TestCase("123 foo", 123, "foo")
    @TestCase("2632374 task name", 2632374, "task name")
    @TestCase("12937 712837 bla", 12937, "712837 bla")
    public shouldParsePrefixCorrectly(input: string, id: number, name: string) {
        const result = splitIdAndName(input);

        Expect(result).toEqual({
            id,
            name
        });
    }

}
