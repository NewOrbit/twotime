/* eslint-disable no-console */

import chalk from "chalk";
import { table, getBorderCharacters } from "table";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import mapValues = require("lodash.mapvalues");  // TODO: factor out this old package

export const log = {
    error: (message: string) => console.log(chalk.red("[ERROR] ") + message),
    warn: (message: string) => console.log(chalk.yellow(`[WARN] ${message}`)),  // insufficient visual impact unless whole text is coloured
    info: (message: string) => console.log(chalk.cyan("[INFO] ") + message),
    table: (headers: string[], rows: string[][]) => {
        const data = [
            headers.map(h => chalk.bold(h)),
            ...rows
        ];

        const tableBorder = mapValues(getBorderCharacters("honeywell"), char => chalk.gray(char || ""));

        const output = table(data, {
            border: tableBorder,
            columns: {
                0: {
                    paddingLeft: 2,
                    paddingRight: 2
                },
                1: {
                    paddingLeft: 2,
                    paddingRight: 2
                },
                2: {
                    paddingLeft: 4,
                    paddingRight: 4
                }
            }
        });

        console.log(output);
    }
};
