#!/usr/bin/env node

import inquirer from "inquirer";
import commander from "commander";

import * as packageInfo from "../package.json";

import { ApiProvider } from "./api-provider";

import { registerCommands } from "./register-commands";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const autocompletePrompt = require("inquirer-autocomplete-prompt");   // really old - TODO: update

inquirer.registerPrompt("autocomplete", autocompletePrompt );

commander
    .name("twotime")
    .version(packageInfo.version, "-v, --version");

registerCommands(commander, new ApiProvider(), packageInfo.version);

commander.parse(process.argv);

if (commander.args.length === 0) {
    commander.help();
}
