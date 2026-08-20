#!/usr/bin/env node

import inquirer from "inquirer";
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import { program } from 'commander';

import packageInfo from "../package.json" with { type: "json" };

import { ApiProvider } from "./api-provider.ts";

import { registerCommands } from "./register-commands.ts";

inquirer.registerPrompt("autocomplete", inquirerPrompt);

program
    .name("twotime")
    .version(packageInfo.version, "-v, --version");

registerCommands(program, new ApiProvider(), packageInfo.version);

program.parse(process.argv);

if (program.args.length === 0) {
    program.help();
}
