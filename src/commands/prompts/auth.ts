import inquirer from "inquirer";

const notEmpty = (input: string) => input.length > 0 ? true : "Please enter a value";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isNumeric = (input: any) => isNaN(input) === false ? true : "Please enter a number";  // 'any' is valid here

export const askAuthDetails = async () => {
    const promptResult = await inquirer.prompt<{
        harvestAccessToken: string,
        harvestAccountId: number,
        targetprocessAccessToken: string,
        targetprocessSubdomain: string
    }>([{
        name: "harvestAccessToken",
        message: "What is your Harvest access token?",
        validate: notEmpty
    }, {
        name: "harvestAccountId",
        message: "What is your Harvest account id?",
        validate: isNumeric,
        filter: input => parseInt(input, 10)
    }, {
        name: "targetprocessAccessToken",
        message: "What is your Targetprocess access token?",
        validate: notEmpty
    }, {
        name: "targetprocessSubdomain",
        message: "What is your Targetprocess subdomain (e.g. 'neworbit')?",
        validate: notEmpty,
        default: "neworbit"
    }]);

    return promptResult;
};
