import { TestFixture, Test, Expect } from "alsatian";
import { HarvestTimeEntry } from "../src/harvest/api";
import { isRunningOrUnfinished } from "../src/utils/is-running-or-unfinished";
import { EntityType } from "../src/harvest/notes/note-metadata";

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
            metadata: {
                userStory: { id: 0, name: "Foo" },
                entity: { type: EntityType.BUG, id: 0, Name: "Foo" },
                finished: false
            },
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
            metadata: {
                userStory: { id: 0, name: "Foo" },
                entity: { type: EntityType.BUG, id: 0, Name: "Foo" },
                finished: true
            },
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
            metadata: {
                userStory: { id: 0, name: "Foo" },
                entity: { type: EntityType.BUG, id: 0, Name: "Foo" },
                finished: true
            },
            hours: 0.00,
            created: "2017-06-26T22:32:52Z",
            running: true
        };

        const result = isRunningOrUnfinished(entry);

        Expect(result).toBe(true);
    }

}
