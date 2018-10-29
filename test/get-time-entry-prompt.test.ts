import { TestCase, TestFixture, Expect } from "alsatian";
import { HarvestTimeEntry } from "../src/harvest/api";
import { EntityType, NoteMetadata } from "../src/harvest/notes/note-metadata";
import { getTimeEntryPrompt } from "../src/utils/get-time-entry-prompt";

@TestFixture()
export class GetTimeEntryPromptTests {

    @TestCase(123, "Foo", 0, EntityType.BUG, "0.00 hours - Foo (bug #123)")
    @TestCase(456, "Bar", 1.2, EntityType.TASK, "1.20 hours - Bar (task #456)")
    @TestCase(48337, "Bla bla this is a bug", 1.748, EntityType.BUG, "1.75 hours - Bla bla this is a bug (bug #48337)")
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

    @TestCase([ "foo", "barr" ], 1.0, "1.00 hours - foo (no tp entity)")
    @TestCase([ "a longer line with some more info" ], 1.78, "1.78 hours - a longer line with some more info (no tp entity)")
    public shouldReturnCorrectPromptForNullMetadata(notes: string[], hours: number, expectedPrompt: string) {
        const entry: HarvestTimeEntry = {
            id: 123,
            metadata: null,
            hours,
            notes,
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

    @TestCase([ ], 1.78, "1.78 hours - no notes provided (no tp entity)")
    @TestCase([ ], 2.55, "2.55 hours - no notes provided (no tp entity)")
    public shouldReturnCorrectPromptForNullMetadataAndNoNotes(notes: string[], hours: number, expectedPrompt: string) {
        const entry: HarvestTimeEntry = {
            id: 123,
            metadata: null,
            hours,
            notes,
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
