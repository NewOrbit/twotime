import { HarvestTimeEntry } from "../harvest/api";

const isUnfinished = (entry: HarvestTimeEntry) => entry.notes.finished === false;

export const getUnfinishedTimeEntries = (entries: HarvestTimeEntry[]) => entries.filter(isUnfinished);
