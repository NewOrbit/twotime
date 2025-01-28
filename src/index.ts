#!/usr/bin/env node

import inquirer from "inquirer";
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import { program } from 'commander';

import * as packageInfo from "../package.json";

import { ApiProvider } from "./api-provider";

import { registerCommands } from "./register-commands";

inquirer.registerPrompt("autocomplete", inquirerPrompt);

program
    .name("twotime")
    .version(packageInfo.version, "-v, --version");

registerCommands(program, new ApiProvider(), packageInfo.version);

program.parse(process.argv);

if (program.args.length === 0) {
    program.help();
}
