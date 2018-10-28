import { TestCase, TestFixture, Expect } from "alsatian";
import { HarvestTimeEntry } from "../src/harvest/api";
import { EntityType, NoteMetadata } from "../src/harvest/notes/note-metadata";
import { getTimeEntryPrompt } from "../src/utils/get-time-entry-prompt";

@TestFixture()
export class GetTimeEntryPromptTests {

    @TestCase(123, "Foo", 0, EntityType.BUG, "bug #123 (0.00 hours) Foo")
    @TestCase(456, "Bar", 1.2, EntityType.TASK, "task #456 (1.20 hours) Bar")
    @TestCase(48337, "Bla bla this is a bug", 1.748, EntityType.BUG, "bug #48337 (1.75 hours) Bla bla this is a bug")
    public shouldReturnCorrectPrompt(entityId: number, entityName: string, hours: number, entityType: EntityType, expectedPrompt: string) {
        const entry: HarvestTimeEntry = {
            id: 123,
            metadata: {
                userStory: null,
                entity: {
                    id: entityId,
                    name: entityName,
                    type: entityType
                },
                finished: false
            },
            hours,
            notes: [],
            created: "2017-06-26T22:32:52Z",
            running: false
        };

        const expected = {
            value: entry,
            name: expectedPrompt
        };

        const result = getTimeEntryPrompt(entry);

        Expect(result).toEqual(expected);
    }

}
