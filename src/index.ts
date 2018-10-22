import * as commander from "commander";
import { ApiProvider } from "./api-provider";
import { registerCommands } from "./register-commands";

commander.name("twotime");

registerCommands(commander, new ApiProvider());

commander.parse(process.argv);

if (commander.args.length === 0) {
    commander.help();
}
