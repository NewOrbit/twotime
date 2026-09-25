import { confirm } from "@inquirer/prompts";

export const askConfirm = async () => {
    return confirm({ message: "Are you happy with your selection?" });
};
