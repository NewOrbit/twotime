import { CommanderStatic } from "commander";
import { ApiProvider } from "./api-provider";

import { start } from "./commands/start";
import { finish } from "./commands/finish";
import { auth } from "./commands/auth";
import { isValidDate } from "./utils/is-valid-date";
import { getTodayDate } from "./utils/get-today-date";
import { log } from "./utils/log";
import { getPastDate } from "./utils/get-past-date";
import { resume } from "./commands/resume";
import { pause } from "./commands/pause";

const getDateForCommand = (command) => {
    if (command.date == null && command.offset == null) {
        return getTodayDate();
    }

    const offset = parseInt(command.offset, 10);

    if (isFinite(offset) && offset > 0) {
        return getPastDate(offset);
    }

    if (isValidDate(command.date)) {
        return command.date;
    }

    return null;
};

const getAllForCommand = (command) => command.all !== null && command.all !== undefined;

const dateFlagConfig = {
    flags: "-d, --date <date>",
    description: "specify a date in YYYY-MM-DD format"
};

const offsetFlagConfig = {
    flags: "-o, --offset <offset>",
    description: "specify a positive number of days in the past"
};

const allFlagConfig = {
    flags: "--all",
    description: "finish all of a day's timers"
};

export const registerCommands = (commander: CommanderStatic, apiProvider: ApiProvider) => {
    commander
        .command("start")
        .description("start a timer")
        .option(dateFlagConfig.flags, dateFlagConfig.description)
        .option(offsetFlagConfig.flags, offsetFlagConfig.description)
        .action((cmd) => {
            const date = getDateForCommand(cmd);

            if (date === null) {
                log.error("Invalid date provided. Use YYYY-MM-DD");
                process.exit(1);
            }

            return start(apiProvider, date);
        });

    commander
        .command("finish")
        .description("finish a timer")
        .option(dateFlagConfig.flags, dateFlagConfig.description)
        .option(offsetFlagConfig.flags, offsetFlagConfig.description)
        .option(allFlagConfig.flags, allFlagConfig.description)
        .action((cmd) => {
            const date = getDateForCommand(cmd);

            if (date === null) {
                log.error("Invalid date provided. Use YYYY-MM-DD");
                process.exit(1);
            }

            const all = getAllForCommand(cmd);

            return finish(apiProvider, date, all);
        });

    commander
        .command("resume")
        .description("resume a timer")
        .action(() => resume(apiProvider));

    commander
        .command("pause")
        .description("pause the currently running timer")
        .action(() => pause(apiProvider));

    commander
        .command("auth")
        .description("authenticate to harvest and targetprocess")
        .action(() => auth(apiProvider));

    commander
        .on("command:*", () => {
            console.error("Invalid command: %s\nSee --help for a list of available commands.", commander.args.join(" "));
            process.exit(1);
        });
};
