import * as inquirer from "inquirer";
import { ApiProvider } from "../api-provider";
import { getTodayDate } from "../utils/get-today-date";
import { HarvestTimeEntry } from "../harvest/api";
import { getTimeEntryPrompt } from "../utils/get-time-entry-prompt";
import { log } from "../utils/log";
import { isRunningOrUnfinished } from "../utils/is-running-or-unfinished";

const entryIsNotFinished = (entry: HarvestTimeEntry) => entry.metadata === null || entry.metadata.finished === false;

export const resume = async (apiProvider: ApiProvider) => {
    const date = getTodayDate();
    const harvestApi = apiProvider.getHarvestApi();

    const entries = await harvestApi.getTimeEntries(date);

    const nonRunning = entries.filter(isRunningOrUnfinished);

    if (nonRunning.length === 0) {
        log.info("You have no non-running unfinished timers");
        return;
    }

    const prompts = nonRunning.map(getTimeEntryPrompt);

    const { timeEntry } = await inquirer.prompt<{ timeEntry: HarvestTimeEntry }>({
        name: "timeEntry",
        message: "Which timer would you like to resume?",
        type: "list",
        choices: prompts
    });

    log.info("Resuming Harvest timer");
    await harvestApi.resumeTimeEntry(timeEntry.id);
    log.info("> Timer resumed");
};
