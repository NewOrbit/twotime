import * as inquirer from "inquirer";
import { ApiProvider } from "../api-provider";
import { getTodayDate } from "../utils/get-today-date";
import { getUnfinishedTimeEntries } from "../utils/get-unfinished-time-entries";
import { HarvestTimeEntry } from "../harvest/api";
import { getTimeEntryPrompt } from "../utils/get-time-entry-prompt";
import { log } from "../utils/log";

export const resume = async (apiProvider: ApiProvider) => {
    const date = getTodayDate();
    const harvestApi = apiProvider.getHarvestApi();

    const entries = await harvestApi.getTimeEntries(date);

    const nonRunning = entries.filter(e => !e.running);

    if (nonRunning.length === 0) {
        log.info("You have no non-running timers");
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
