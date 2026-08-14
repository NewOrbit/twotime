import { input } from "@inquirer/prompts";

import { parseDuration } from "../../utils/parse-duration.ts";

export const askHours = async (message: string, defaultValue?: number) => {
    // Ensure this method can't return until the user has entered a valid number
    let confirmedHours = NaN;
    while (Number.isNaN(confirmedHours)) {
        const hours = await input({
            message: `${message} (0.00 or 0:00)`,
            // An undefined default is the same as not offering one at all
            default: defaultValue?.toFixed(2),
            validate: value => {
                return (isNaN(Number(value)) === false || parseDuration(value) !== null)
                    ? true
                    : "Enter a duration in the format 0.00 or 0:00";
            },
            // Clear a rejected value, otherwise the retry appends to what was typed before
            theme: { validationFailureMode: "clear" }
        });

        const parsedTimeEntry = parseDuration(hours);
        confirmedHours = parsedTimeEntry !== null ? parsedTimeEntry.hours + (parsedTimeEntry.minutes / 60) : parseFloat(hours);
    }

    return confirmedHours;
};
