import { ApiProvider } from "../api-provider";

import { log } from "../utils/log";

import { askAuthDetails } from "./prompts/auth";

export const auth = async (apiProvider: ApiProvider) => {
    const {
        harvestAccessToken,
        harvestAccountId,
        targetprocessAccessToken,
        targetprocessSubdomain
    } = await askAuthDetails();

    apiProvider.setHarvestConfig({ accessToken: harvestAccessToken, accountId: harvestAccountId });
    apiProvider.setTargetprocessConfig({ accessToken: targetprocessAccessToken, subdomain: targetprocessSubdomain });

    log.info("Authentication complete.");
};
