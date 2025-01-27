import * as inquirer from "inquirer";

import { ApiProvider } from "../api-provider";

import { HarvestTimeEntry } from "../harvest/models/time-entry";

import { getTodaysDate } from "../utils/dates";
import { getTimeEntryPrompt } from "../utils/get-time-entry-prompt";
import { log } from "../utils/log";
import { isPausedAndUnfinished } from "../utils/is-paused-and-unfinished";

export const resume = async (apiProvider: ApiProvider) => {
    const date = getTodaysDate();
    const harvestApi = apiProvider.getHarvestApi();

    const entries = await harvestApi.getTimeEntries(date);

    const nonRunning = entries.filter(isPausedAndUnfinished);

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
