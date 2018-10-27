import { ApiProvider } from "../api-provider";
import { getTodayDate } from "../utils/get-today-date";
import { log } from "../utils/log";
import { HarvestTimeEntry } from "../harvest/api";
import { getEntityTypeText } from "../utils/get-entity-type-text";
import chalk from "chalk";

const getTypeForEntry = (entry: HarvestTimeEntry) => {
    if (entry.notes.entity) {
        return getEntityTypeText(entry.notes.entity.type);
    }

    return chalk.gray("n/a");
};

const getTextForEntry = (entry: HarvestTimeEntry) => {
    if (entry.notes.entity) {
        return `${ entry.notes.entity.name } (#${ entry.notes.entity.id })`;
    }

    const lines = entry.text.match(/[^\r\n]+/g);
    return lines[0];
};

const getTableRowForEntry = (entry: HarvestTimeEntry) => {
    return [
        getTypeForEntry(entry),
        getTextForEntry(entry),
        entry.hours.toFixed(2)
    ];
};

export const list = async (apiProvider: ApiProvider) => {
    const date = getTodayDate();
    const harvestApi = apiProvider.getHarvestApi();

    const entries = await harvestApi.getTimeEntries(date);

    // sort them in chronological
    entries.sort((a, b) => (new Date(a.created) as any) - (new Date(b.created) as any));

    const rows = entries.map(getTableRowForEntry);
    const total = entries.reduce((accumulator, entry) => accumulator + entry.hours, 0);

    log.table([ "Entity Type", "Title", "Hours" ], rows);
    log.info(`Total: ${ total.toFixed(2) }`);
};
