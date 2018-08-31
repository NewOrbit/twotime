import { TestFixture, TestCase, Test, Expect } from "alsatian";
import { parseNotes } from "../../src/harvest/notes";

@TestFixture()
export class NotesTests {
    
    @Test()
    public shouldParseFinishedBugCorrectly() {
        const input = "> user_story #35858 4.1	System Automatically Deletes all Previously Archived – Single Use Process"
            + "> bug #40732 v8.13 - FK AdditionalApplicationAnswers"
            + "finished";

        const expected = {
            userStory: {
                id: 35858,
                name: "4.1	System Automatically Deletes all Previously Archived – Single Use Process"
            },
            bug: {
                id: 40732,
                name: "v8.13 - FK AdditionalApplicationAnswers"
            },
            task: null,
            finished: true
        };

        const res = parseNotes(input);

        Expect(res).toEqual(expected);
    }

}
