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
import { list } from "./commands/list";

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

const getTpForCommand = (command) => {
    if (command.tp === undefined) {
        return undefined;
    }

    const parsed = parseInt(command.tp, 10);

    if (isNaN(parsed)) {
        return null;
    }

    return parsed;
};

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

const tpFlagConfig = {
    flags: "--tp <id>",
    description: "Start a timer for a given TP id"
};

export const registerCommands = (commander: CommanderStatic, apiProvider: ApiProvider, packageVersion: string) => {
    commander
        .command("start")
        .description("start a timer")
        .option(dateFlagConfig.flags, dateFlagConfig.description)
        .option(offsetFlagConfig.flags, offsetFlagConfig.description)
        .option(tpFlagConfig.flags, tpFlagConfig.description)
        .action((cmd) => {
            const date = getDateForCommand(cmd);
            const tp = getTpForCommand(cmd);

            if (date === null) {
                log.error("Invalid date provided. Use YYYY-MM-DD");
                process.exit(1);
            }

            if (tp === null) {
                log.error("Invalid Targetprocess id provided. Must be a number");
                process.exit(1);
            }

            return start(packageVersion, apiProvider, date, tp);
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

            return finish(packageVersion, apiProvider, date, all);
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
        .command("list")
        .description("list a day's timesheet")
        .option(dateFlagConfig.flags, dateFlagConfig.description)
        .option(offsetFlagConfig.flags, offsetFlagConfig.description)
        .action((cmd) => {
            const date = getDateForCommand(cmd);

            if (date === null) {
                log.error("Invalid date provided. Use YYYY-MM-DD");
                process.exit(1);
            }

            return list(apiProvider, date);
        });

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
