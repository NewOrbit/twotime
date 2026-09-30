import type { ApiProvider } from "../api-provider.ts";

import { log } from "../utils/log.ts";

import { askAuthDetails } from "./prompts/auth.ts";

export const auth = async (apiProvider: ApiProvider) => {
    const { harvestAccessToken, harvestAccountId, targetprocessAccessToken, targetprocessSubdomain } = await askAuthDetails();

    apiProvider.setHarvestConfig({ accessToken: harvestAccessToken, accountId: harvestAccountId });
    apiProvider.setTargetprocessConfig({ accessToken: targetprocessAccessToken, subdomain: targetprocessSubdomain });

    log.info("Authentication complete.");
};
