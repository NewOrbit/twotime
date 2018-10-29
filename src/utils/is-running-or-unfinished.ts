import { HarvestTimeEntry } from "../harvest/api";

export const isRunningOrUnfinished = (entry: HarvestTimeEntry) => {
    if (entry.running) {
        return true;
    }

    if (entry.metadata === null) {
        return entry.running;
    }

    return entry.metadata.finished === false;
};
