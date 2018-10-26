import { ApiProvider } from "../api-provider";
import { getTodayDate } from "../utils/get-today-date";
import { log } from "../utils/log";
import { askConfirm } from "./prompts/confirm";

export const pause = async (apiProvider: ApiProvider) => {
    const date = getTodayDate();
    const harvestApi = apiProvider.getHarvestApi();

    const entries = await harvestApi.getTimeEntries(date);

    const runningTimeEntry = entries.find(e => e.running);

    if (!runningTimeEntry) {
        log.info("You do not have a running timer");
        return;
    }

    log.info("About to pause timer:");

    const textLines = runningTimeEntry.text.match(/[^\r\n]+/g);
    textLines.forEach(log.info);

    const confirm = await askConfirm();

    if (!confirm) {
        return;
    }

    log.info("Pausing Harvest timer");
    await harvestApi.stopTimeEntry(runningTimeEntry.id);
    log.info("> Timer paused");
};
