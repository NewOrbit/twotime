import { input } from "@inquirer/prompts";

const notEmpty = (value: string) => value.length > 0 ? true : "Please enter a value";
const isNumeric = (value: string) => isNaN(Number(value)) === false ? true : "Please enter a number";

// Clear a rejected value, otherwise the retry appends to what was typed before
const theme = { validationFailureMode: "clear" } as const;

export const askAuthDetails = async () => {
    const harvestAccessToken = await input({
        message: "What is your Harvest access token?",
        validate: notEmpty,
        theme
    });

    const harvestAccountId = await input({
        message: "What is your Harvest account id?",
        validate: isNumeric,
        theme
    });

    const targetprocessAccessToken = await input({
        message: "What is your Targetprocess access token?",
        validate: notEmpty,
        theme
    });

    const targetprocessSubdomain = await input({
        message: "What is your Targetprocess subdomain (e.g. 'neworbit')?",
        validate: notEmpty,
        default: "neworbit",
        theme
    });

    return {
        harvestAccessToken,
        // The prompt returns a string. inquirer's old `filter` hook used to do this conversion.
        harvestAccountId: parseInt(harvestAccountId, 10),
        targetprocessAccessToken,
        targetprocessSubdomain
    };
};
