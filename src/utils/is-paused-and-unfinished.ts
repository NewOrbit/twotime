import { HarvestTimeEntry } from "../harvest/api";

export const isPausedAndUnfinished = (entry: HarvestTimeEntry) => {
    const unfinished = entry.metadata === null || entry.metadata.finished === false;

    return entry.running === false && unfinished === true;
};
