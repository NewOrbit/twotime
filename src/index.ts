#!/usr/bin/env node

import * as commander from "commander";
import { ApiProvider } from "./api-provider";
import { registerCommands } from "./register-commands";

/* tslint:disable:no-var-requires */
const packageInfo = require("../package.json");
/* tslint:enable:no-var-requires */

commander
    .name("twotime")
    .version(packageInfo.version);

registerCommands(commander, new ApiProvider());

commander.parse(process.argv);

if (commander.args.length === 0) {
    commander.help();
}
