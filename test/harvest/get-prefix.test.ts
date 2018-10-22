import { TestFixture, TestCase, Expect } from "alsatian";
import { getPrefix } from "../../src/harvest/notes/get-prefix";

@TestFixture()
export class GetPrefixTests {

    @TestCase("UserStory", "> user_story #")
    @TestCase("Bug", "> bug #")
    @TestCase("Task", "> task #")
    @TestCase("Foo", "[UNRECOGNISED RESOURCE TYPE Foo]")
    public shouldParsePrefixCorrectly(resourceType: string, expected: string) {
        const result = getPrefix({ ResourceType: resourceType });

        Expect(result).toEqual(expected);
    }

}
