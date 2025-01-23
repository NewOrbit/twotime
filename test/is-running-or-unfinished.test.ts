import { TestFixture, Test, Expect } from "alsatian";
import { HarvestTimeEntry } from "../src/harvest/models/time-entry";
import { isRunningOrUnfinished } from "../src/utils/is-running-or-unfinished";
import { NoteMetadataBuilder } from "./_builders/note-metadata.builder";

@TestFixture()
export class IsRunningOrUnfinishedTests {

    @Test()
    public shouldReturnTrueforRunningEntry() {
        const entry: HarvestTimeEntry = {
            id: 0,
            notes: [],
            metadata: null,
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: true
        };

        const result = isRunningOrUnfinished(entry);

        Expect(result).toBe(true);
    }

    @Test()
    public shouldReturnTrueforUnfinishedEntry() {
        const entry: HarvestTimeEntry = {
            id: 0,
            notes: [],
            metadata: new NoteMetadataBuilder().withFinished(false).build(),
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: false
        };

        const result = isRunningOrUnfinished(entry);

        Expect(result).toBe(true);
    }

    @Test()
    public shouldReturnFalseforFinishedEntry() {
        const entry: HarvestTimeEntry = {
            id: 0,
            notes: [],
            metadata: new NoteMetadataBuilder().withFinished(true).build(),
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: false
        };

        const result = isRunningOrUnfinished(entry);

        Expect(result).toBe(false);
    }

    @Test()
    public shouldReturnTrueforRunningFinishedEntry() {
        const entry: HarvestTimeEntry = {
            id: 0,
            notes: [],
            metadata: new NoteMetadataBuilder().withFinished(true).build(),
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: true
        };

        const result = isRunningOrUnfinished(entry);

        Expect(result).toBe(true);
    }

}
