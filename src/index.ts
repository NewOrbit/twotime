import { HarvestApi } from "./harvest/api";

import { accessToken, accountId } from "./config";

const api = new HarvestApi(accessToken, accountId);
api.getProjects().then(p => {
	api.startTimeEntry(p[0].id, p[0].tasks[0].id, "2018-09-05", "testing twotime")
		.then(entry => {
			const id = entry.id;

			api.updateNotes(id, "foo! FOO FOO! FOOOOO!");
		});

	/*api.getTimeEntries("2018-08-31").then(e => {
		console.log(e);
	})*/
});
