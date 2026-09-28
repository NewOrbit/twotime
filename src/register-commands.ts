import type { Command } from "commander";

import type { ApiProvider } from "./api-provider.ts";

import { start } from "./commands/start.ts";
import { finish } from "./commands/finish.ts";
import { auth } from "./commands/auth.ts";
import { resume } from "./commands/resume.ts";
import { pause } from "./commands/pause.ts";
import { list } from "./commands/list.ts";

import { getTodaysDate, getDateInPast, isValidDate } from "./utils/dates.ts";
import { log } from "./utils/log.ts";
import { runCommand } from "./utils/run-command.ts";

// Get date for a command - unfortunately the 'commander' package does not give a command type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getDateForCommand = (command: any) => {
    if (command.date == null && command.offset == null) {
        return getTodaysDate();
    }

    const offset = parseInt(command.offset, 10);

    if (isFinite(offset) && offset > 0) {
        return getDateInPast(offset);
    }

    if (isValidDate(command.date)) {
        return command.date;
    }

    return null;
};

// Get TP ID for a command - unfortunately the 'commander' package does not give a command type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTpForCommand = (command: any) => {
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

export const registerCommands = (commander: Command, apiProvider: ApiProvider, packageVersion: string) => {
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
                log.error("Invalid Targetprocess ID provided. Must be a number");
                process.exit(1);
            }

            return runCommand(() => start(packageVersion, apiProvider, date, tp));
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

            const all = cmd.all !== null && cmd.all !== undefined;
            return runCommand(() => finish(packageVersion, apiProvider, date, all));
        });

    commander
        .command("resume")
        .description("resume a timer")
        .action(() => runCommand(() => resume(apiProvider)));

    commander
        .command("pause")
        .description("pause the currently running timer")
        .action(() => runCommand(() => pause(apiProvider)));

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

            return runCommand(() => list(apiProvider, date));
        });

    commander
        .command("auth")
        .description("authenticate to harvest and targetprocess")
        .action(() => runCommand(() => auth(apiProvider)));

    commander
        .on("command:*", () => {
            log.error(`Invalid command: ${commander.args.join(" ")}\nSee --help for a list of available commands.`);
            process.exit(1);
        });
};
