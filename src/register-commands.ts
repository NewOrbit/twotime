import { CommanderStatic } from "commander";
import { ApiProvider } from "./api-provider";

import { start } from "./commands/start";
import { finish } from "./commands/finish";
import { auth } from "./commands/auth";

export const registerCommands = (commander: CommanderStatic, apiProvider: ApiProvider) => {
    commander
        .command("start")
        .description("start a timer")
        .action(() => start(apiProvider));

    commander
        .command("finish")
        .description("finish a timer")
        .action(() => finish(apiProvider));

    commander
        .command("auth")
        .description("authenticate to harvest and targetprocess")
        .action(() => auth(apiProvider));

    commander
        .on('command:*', () => {
            console.error('Invalid command: %s\nSee --help for a list of available commands.', commander.args.join(' '));
            process.exit(1);
        });
};
