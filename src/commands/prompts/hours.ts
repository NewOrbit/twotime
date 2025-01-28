import inquirer, { QuestionCollection } from 'inquirer';

import { parseDuration } from "../../utils/parse-duration";

export const askHours = async (message: string, defaultValue?: number) => {
    const questions: QuestionCollection = {
        name: "hours",
        message: `${message} (0.00 or 0:00)`,
        validate: input => {
            return (isNaN(input) === false || parseDuration(input) !== null)
                ? true
                : "Enter a duration in the format 0.00 or 0:00";
        }
    };

    // If a default value was provided, add it to the questions object
    if (defaultValue !== undefined) {
        questions.default = defaultValue.toFixed(2);
    }

    // Ensure this method can't return until the user has entered a valid number
    let confirmedHours = NaN;
    while (Number.isNaN(confirmedHours)) {
        const { hours } = await inquirer.prompt<{ hours: string }>([ questions ]);
        const parsedTimeEntry = parseDuration(hours);
        confirmedHours = parsedTimeEntry !== null ? parsedTimeEntry.hours + (parsedTimeEntry.minutes / 60) : parseFloat(hours);
    }

    return confirmedHours;
};
