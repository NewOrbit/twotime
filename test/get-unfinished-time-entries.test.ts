import { Test, TestFixture, Expect } from "alsatian";
import { HarvestTimeEntry } from "../src/harvest/api";
import { EntityType, NoteInformation } from "../src/harvest/notes/note-information";
import { getUnfinishedTimeEntries } from "../src/utils/get-unfinished-time-entries";

const timeEntryFromNotes = (notes: NoteInformation) => {
    return {
        id: 123,
        notes,
        hours: 0,
        created: "2017-06-26T22:32:52Z",
        running: false
    } as HarvestTimeEntry;
};

@TestFixture()
export class GetUnfinishedTimeEntriesTests {

    @Test()
    public shouldNotReturnUnlinkedNotes() {
        const unlinkedNote = timeEntryFromNotes({
            userStory: null,
            entity: null,
            finished: false,
            additionalNotes: []
        });

        const linkedNoteUserStory = timeEntryFromNotes({
            userStory: {
                id: 123,
                name: "Foo"
            },
            entity: null,
            finished: false,
            additionalNotes: []
        });

        const linkedNoteTask = timeEntryFromNotes({
            userStory: null,
            entity: {
                type: EntityType.TASK,
                id: 123,
                name: "Foo"
            },
            finished: false,
            additionalNotes: []
        });

        const linkedNoteBug = timeEntryFromNotes({
            userStory: null,
            entity: {
                type: EntityType.BUG,
                id: 123,
                name: "Foo"
            },
            finished: false,
            additionalNotes: []
        });

        const unfinished = getUnfinishedTimeEntries([ unlinkedNote, linkedNoteUserStory, linkedNoteTask, linkedNoteBug ]);

        Expect(unfinished).not.toContain(unlinkedNote);
        Expect(unfinished).toContain(linkedNoteTask);
        Expect(unfinished).toContain(linkedNoteBug);
        Expect(unfinished).toContain(linkedNoteUserStory);
    }

    @Test()
    public shouldNotReturnFinished() {
        const unfinishedNotes = timeEntryFromNotes({
            userStory: {
                id: 123,
                name: "Foo"
            },
            entity: null,
            finished: false,
            additionalNotes: []
        });

        const finishedNotes = timeEntryFromNotes({
            userStory: null,
            entity: {
                type: EntityType.TASK,
                id: 123,
                name: "Foo"
            },
            finished: true,
            additionalNotes: []
        });

        const unfinished = getUnfinishedTimeEntries([ unfinishedNotes, finishedNotes ]);

        Expect(unfinished).not.toContain(finishedNotes);
        Expect(unfinished).toContain(unfinishedNotes);
    }

}
