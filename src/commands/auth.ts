import { ApiProvider } from "../api-provider";
import { log } from "../utils/log";
import { askAuthDetails } from "./prompts/auth";

export const auth = async (apiProvider: ApiProvider) => {
    const {
        harvestAccessToken,
        harvestAccountId,
        targetprocessUsername,
        targetprocessPassword
    } = await askAuthDetails();

    apiProvider.setHarvestConfig(harvestAccessToken, harvestAccountId);
    apiProvider.setTargetprocessConfig(targetprocessUsername, targetprocessPassword);

    log.info("Authentication complete.");
};
