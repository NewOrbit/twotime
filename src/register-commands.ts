import { CommanderStatic } from "commander";
import { ApiProvider } from "./api-provider";

import { start } from "./commands/start";
import { finish } from "./commands/finish";
import { auth } from "./commands/auth";
import { isValidDate } from "./utils/is-valid-date";
import { getTodayDate } from "./utils/get-today-date";
import { log } from "./utils/log";

const getDateForCommand = (command) => {
    if (command.date === undefined || command.date === null) {
        return getTodayDate();
    }

    if (isValidDate(command.date)) {
        return command.date;
    }

    return null;
};

export const registerCommands = (commander: CommanderStatic, apiProvider: ApiProvider) => {
    commander
        .command("start")
        .description("start a timer")
        .option("-d, --date <date>", "specify a date in YYYY-MM-DD format")
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
        .option("-d, --date <date>", "specify a date in YYYY-MM-DD format")
        .action((cmd) => {
            const date = getDateForCommand(cmd);

            if (date === null) {
                log.error("Invalid date provided. Use YYYY-MM-DD");
                process.exit(1);
            }

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
