import type { HarvestTimeEntry } from "../harvest/models/time-entry.ts";

export const isPausedAndUnfinished = (entry: HarvestTimeEntry) => {
    const unfinished = entry.metadata === null || entry.metadata.finished === false;

    return entry.running === false && unfinished === true;
};
