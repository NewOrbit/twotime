import * as commander from "commander";

import { start } from "./commands/start";
import { finish } from "./commands/finish";
import { auth } from "./commands/auth";

commander.name("twotime");

commander
    .command("start")
    .description("start a timer")
    .action(start);

commander
    .command("finish")
    .description("finish a timer")
    .action(finish);

commander
    .command("auth")
    .description("authenticate to harvest and targetprocess")
    .action(auth);

commander
    .on('command:*', () => {
        console.error('Invalid command: %s\nSee --help for a list of available commands.', commander.args.join(' '));
        process.exit(1);
    });

commander.parse(process.argv);
