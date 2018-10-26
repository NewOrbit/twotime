import { NoteInformation } from "../harvest/notes/note-information";
import { HarvestTimeEntry } from "../harvest/api";

const isLinkedNote = (note: NoteInformation) => note.userStory !== null || note.entity !== null;
const isUnfinished = (entry: HarvestTimeEntry) => entry.notes.finished === false && isLinkedNote(entry.notes);

export const getUnfinishedTimeEntries = (entries: HarvestTimeEntry[]) => entries.filter(isUnfinished);
