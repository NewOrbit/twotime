import { ApiProvider } from "../api-provider";
import { getTodaysDate } from "../utils/dates";
import { log } from "../utils/log";

export const pause = async (apiProvider: ApiProvider) => {
    const date = getTodaysDate();
    const harvestApi = apiProvider.getHarvestApi();

    const entries = await harvestApi.getTimeEntries(date);

    const runningTimeEntry = entries.find(e => e.running);

    if (!runningTimeEntry) {
        log.info("You do not have a running timer");
        return;
    }

    log.info("About to pause timer:");

    runningTimeEntry.notes.forEach(log.info);

    log.info("Pausing Harvest timer");
    await harvestApi.stopTimeEntry(runningTimeEntry.id);
    log.info("> Timer paused");
};
