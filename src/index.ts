import { HarvestApi } from "./api/harvest";

import { accessToken, accountId } from "./config";

const api = new HarvestApi(accessToken, accountId);
api.getProjects().then(p => console.log(p));
