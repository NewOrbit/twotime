/* tslint:disable:no-console */

import chalk from "chalk";

export const log = {
    error: (message: string) => console.log(chalk.red("[ERROR] ") + message),
    info: (message: string) => console.log(chalk.cyan("[INFO] ") + message)
};
