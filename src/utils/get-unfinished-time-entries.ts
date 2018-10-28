import { HarvestTimeEntry } from "../harvest/api";

const isUnfinished = (entry: HarvestTimeEntry) => entry.metadata.finished === false;

export const getUnfinishedTimeEntries = (entries: HarvestTimeEntry[]) => entries.filter(isUnfinished);
