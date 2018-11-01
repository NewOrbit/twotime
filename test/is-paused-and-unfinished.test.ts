import { TestFixture, Test, Expect } from "alsatian";
import { HarvestTimeEntry } from "../src/harvest/api";
import { isPausedAndUnfinished } from "../src/utils/is-paused-and-unfinished";
import { NoteMetadataBuilder } from "./_builders/note-metadata.builder";

@TestFixture()
export class IsPausedAndUnfinishedTests {

    @Test()
    public shouldReturnFalseforRunningEntry() {
        const entry: HarvestTimeEntry = {
            id: 0,
            notes: [],
            metadata: null,
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: true
        };

        const result = isPausedAndUnfinished(entry);

        Expect(result).toBe(false);
    }

    @Test()
    public shouldReturnTrueforUnfinishedNonRunningEntry() {
        const entry: HarvestTimeEntry = {
            id: 0,
            notes: [],
            metadata: new NoteMetadataBuilder().withFinished(false).build(),
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: false
        };

        const result = isPausedAndUnfinished(entry);

        Expect(result).toBe(true);
    }

    @Test()
    public shouldReturnTrueforNonRunningEntryWithoutMetadata() {
        const entry: HarvestTimeEntry = {
            id: 0,
            notes: [],
            metadata: null,
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: false
        };

        const result = isPausedAndUnfinished(entry);

        Expect(result).toBe(true);
    }

    @Test()
    public shouldReturnFalseforFinishedNonRunningEntry() {
        const entry: HarvestTimeEntry = {
            id: 0,
            notes: [],
            metadata: new NoteMetadataBuilder().withFinished(true).build(),
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: false
        };

        const result = isPausedAndUnfinished(entry);

        Expect(result).toBe(false);
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

        const result = isPausedAndUnfinished(entry);

        Expect(result).toBe(false);
    }

    @Test()
    public shouldReturnFalseforRunningFinishedEntry() {
        const entry: HarvestTimeEntry = {
            id: 0,
            notes: [],
            metadata: new NoteMetadataBuilder().withFinished(true).build(),
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: true
        };

        const result = isPausedAndUnfinished(entry);

        Expect(result).toBe(false);
    }

}
