#!/usr/bin/env node

import * as commander from "commander";
import { ApiProvider } from "./api-provider";
import { registerCommands } from "./register-commands";

const packageInfo = require("../package.json");

commander
    .name("twotime")
    .version(packageInfo.version);

registerCommands(commander, new ApiProvider());

commander.parse(process.argv);

if (commander.args.length === 0) {
    commander.help();
}
