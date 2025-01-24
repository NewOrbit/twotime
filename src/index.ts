#!/usr/bin/env node

import * as inquirer from "inquirer";
import commander from "commander";
import { ApiProvider } from "./api-provider";
import { registerCommands } from "./register-commands";

/* tslint:disable:no-var-requires */
const autocompletePrompt = require("inquirer-autocomplete-prompt");
const packageInfo = require("../package.json");
/* tslint:enable:no-var-requires */

inquirer.registerPrompt("autocomplete", autocompletePrompt);

commander
    .name("twotime")
    .version(packageInfo.version, "-v, --version");

registerCommands(commander, new ApiProvider(), packageInfo.version);

commander.parse(process.argv);

if (commander.args.length === 0) {
    commander.help();
}
