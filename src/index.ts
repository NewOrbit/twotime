import { HarvestApi } from "./api/harvest";

import { accessToken, accountId } from "./config";

const api = new HarvestApi(accessToken, accountId);
api.getProjects().then(p => {
	//api.startTimer(p[0].id, p[0].tasks[0].id, "2018-08-31", "testing twotime");

	api.getTimeEntries("2018-08-31").then(e => {
		console.log(e);
	})
});
