import { ApiProvider } from "../api-provider";

import { log } from "../utils/log";

import { askAuthDetails } from "./prompts/auth";

export const auth = async (apiProvider: ApiProvider) => {
    const {
        harvestAccessToken,
        harvestAccountId,
        targetprocessUsername,
        targetprocessPassword,
        targetprocessSubdomain
    } = await askAuthDetails();

    apiProvider.setHarvestConfig({ accessToken: harvestAccessToken, accountId: harvestAccountId });
    apiProvider.setTargetprocessConfig({username: targetprocessUsername, password: targetprocessPassword, subdomain: targetprocessSubdomain });

    log.info("Authentication complete.");
};
