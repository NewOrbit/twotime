import { Test, TestFixture, Expect } from "alsatian";
import { HarvestTimeEntry } from "../src/harvest/api";
import { EntityType, NoteMetadata } from "../src/harvest/notes/note-metadata";
import { getUnfinishedTimeEntries } from "../src/utils/get-unfinished-time-entries";

const timeEntryFromMetadata = (metadata: NoteMetadata) => {
    return {
        id: 123,
        metadata,
        hours: 0,
        created: "2017-06-26T22:32:52Z",
        running: false,
        notes: []
    } as HarvestTimeEntry;
};

@TestFixture()
export class GetUnfinishedTimeEntriesTests {

    @Test()
    public shouldReturnUnlinkedNotes() {
        const unlinkedNote = timeEntryFromMetadata({
            userStory: null,
            entity: null,
            finished: false
        });

        const linkedNoteUserStory = timeEntryFromMetadata({
            userStory: {
                id: 123,
                name: "Foo"
            },
            entity: null,
            finished: false
        });

        const unfinished = getUnfinishedTimeEntries([ unlinkedNote, linkedNoteUserStory ]);

        Expect(unfinished).toContain(unlinkedNote);
        Expect(unfinished).toContain(linkedNoteUserStory);
    }

    @Test()
    public shouldNotReturnFinished() {
        const unfinishedNotes = timeEntryFromMetadata({
            userStory: {
                id: 123,
                name: "Foo"
            },
            entity: null,
            finished: false
        });

        const finishedNotes = timeEntryFromMetadata({
            userStory: null,
            entity: {
                type: EntityType.TASK,
                id: 123,
                name: "Foo"
            },
            finished: true
        });

        const unfinished = getUnfinishedTimeEntries([ unfinishedNotes, finishedNotes ]);

        Expect(unfinished).not.toContain(finishedNotes);
        Expect(unfinished).toContain(unfinishedNotes);
    }

}
