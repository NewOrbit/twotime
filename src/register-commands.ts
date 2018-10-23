import { CommanderStatic } from "commander";
import { ApiProvider } from "./api-provider";

import { start } from "./commands/start";
import { finish } from "./commands/finish";
import { auth } from "./commands/auth";
import { parseDateOption } from "./utils/parse-date-option";
import { getTodayDate } from "./utils/get-today-date";

export const registerCommands = (commander: CommanderStatic, apiProvider: ApiProvider) => {
    commander
        .command("start")
        .description("start a timer")
        .option("-d, --date <date>", "specify a date in YYYY-MM-DD format")
        .action((cmd) => {
            const date = parseDateOption(getTodayDate, cmd.date);

            return start(apiProvider, date);
        });

    commander
        .command("finish")
        .description("finish a timer")
        .option("-d, --date <date>", "specify a date in YYYY-MM-DD format")
        .action((cmd) => {
            const date = parseDateOption(getTodayDate, cmd.date);

            return finish(apiProvider, date);
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
