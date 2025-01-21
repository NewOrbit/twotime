import { ApiProvider } from "../api-provider";
import { log } from "../utils/log";
import { HarvestTimeEntry } from "../harvest/models/time-entry";
import chalk from "chalk";

const getTypeForEntry = (entry: HarvestTimeEntry) => {
    let resType = '';
    if (entry.metadata) {
        resType = entry.metadata.tpItem?.ResourceType?.toString() || '';
    }

    return resType || chalk.gray("n/a");
};

const getTextForEntry = (entry: HarvestTimeEntry) => {
    if (entry.metadata && entry.metadata.tpItem) {
        return `${ entry.metadata.tpItem.Name } (#${ entry.metadata.tpItem.Id })`;
    }

    return entry.notes[0];
};

const getStatusForEntry = (entry: HarvestTimeEntry) => {
    return entry.running ? "running" : chalk.gray("paused");
};

const getTableRowForEntry = (entry: HarvestTimeEntry) => {
    return [
        getTypeForEntry(entry),
        getTextForEntry(entry),
        entry.hours.toFixed(2),
        getStatusForEntry(entry)
    ];
};

export const list = async (apiProvider: ApiProvider, date: string) => {
    const harvestApi = apiProvider.getHarvestApi();

    const entries = await harvestApi.getTimeEntries(date);

    // sort them in chronological
    entries.sort((a, b) => (new Date(a.created) as any) - (new Date(b.created) as any));

    const rows = entries.map(getTableRowForEntry);
    const total = entries.reduce((accumulator, entry) => accumulator + entry.hours, 0);

    log.table([ "Entity Type", "Title", "Hours", "Status" ], rows);
    log.info(`Total: ${ total.toFixed(2) }`);
};
