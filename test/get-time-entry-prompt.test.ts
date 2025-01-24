import { TestCase, TestFixture, Expect } from "alsatian";
import { HarvestTimeEntry } from "../src/harvest/models/time-entry";
import { EntityType } from "../src/target-process/models/tp-bookable-entity";
import { getTimeEntryPrompt } from "../src/utils/get-time-entry-prompt";
import { EntityBuilder } from "./_builders/entity.builder";
import { NoteMetadataBuilder } from "./_builders/note-metadata.builder";

@TestFixture()
export class GetTimeEntryPromptTests {

    @TestCase(123, "Foo", 0, EntityType.BUG, "0.00 hours - Foo (Bug #123)")
    @TestCase(456, "Bar", 1.2, EntityType.TASK, "1.20 hours - Bar (Task #456)")
    @TestCase(48337, "Bla bla this is a bug", 1.748, EntityType.BUG, "1.75 hours - Bla bla this is a bug (Bug #48337)")
    public shouldReturnCorrectPrompt(entityId: number, entityName: string, hours: number, entityType: EntityType, expectedPrompt: string) {
        const entity = new EntityBuilder().withId(entityId).withName(entityName).withType(entityType).build();

        const entry: HarvestTimeEntry = {
            id: 123,
            metadata: new NoteMetadataBuilder().withEntity(entity).build(),
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
