import * as inquirer from "inquirer";

export const askConfirm = async () => {
    const response = await inquirer.prompt<{ confirm: boolean }>({
        name: "confirm",
        type: "confirm",
        message: "Are you happy with your selection?"
    });

    return response.confirm;
};
