import inquirer = require("inquirer");
import { parseDuration } from "../../utils/parse-duration";

export const askHours = async (message: string) => {
    const { hours } = await inquirer.prompt<{ hours: string }>([{
        name: "hours",
        default: "0",
        message: `${message} (0.00 or 0:00)`,
        validate: input => {
            if (isNaN(input) === false || parseDuration(input) !== null) {
                return true;
            }

            return "Enter a duration in the format 0.00 or 0:00";
        }
    }]);

    const parsed = parseDuration(hours);

    if (parsed !== null) {
        return parsed.hours + (parsed.minutes / 60);
    }

    return parseFloat(hours);
};
