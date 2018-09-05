import { HarvestApi } from "./harvest/api";

import * as config from "./config";
import { TargetProcessApi } from "./tp/api";

const harvestApi = new HarvestApi(config.harvest.accessToken, config.harvest.accountId);
/*harvestApi.getProjects().then(p => {
	harvestApi.startTimeEntry(p[0].id, p[0].tasks[0].id, "2018-09-05", "testing twotime")
		.then(entry => {
			const id = entry.id;

			harvestApi.updateNotes(id, "foo! FOO FOO! FOOOOO!");
		});

	harvestApi.getTimeEntries("2018-08-31").then(e => {
		console.log(e);
	})
});*/

const tpApi = new TargetProcessApi(config.targetProcess.username, config.targetProcess.password);
tpApi.getBug(40732).then(e => console.log(e));
