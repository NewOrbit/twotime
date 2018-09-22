import { HarvestApi } from "./harvest/api";
import { TargetProcessApi } from "./tp/api";

import * as config from "./config";

const harvestApi = new HarvestApi(config.harvest.accessToken, config.harvest.accountId);
const tpApi = new TargetProcessApi(config.targetProcess.username, config.targetProcess.password);

/*
harvestApi.getProjects().then(p => {
	harvestApi.startTimeEntry(p[0].id, p[0].tasks[0].id, "2018-09-05", "testing twotime")
		.then(entry => {
			const id = entry.id;

			harvestApi.updateNotes(id, "foo! FOO FOO! FOOOOO!");
		});

	harvestApi.getTimeEntries("2018-08-31").then(e => {
		console.log(e);
	})
});


tpApi.getBug(40732).then(e => console.log(e));
*/

import * as commander from "commander";

import { start } from "./commands/start";
import { finish } from "./commands/finish";
import { auth } from "./commands/auth";

commander.name("twotime");

commander
    .command("start")
    .description("start a timer")
    .action(() => start(harvestApi, tpApi));

commander
    .command("finish")
    .description("finish a timer")
    .action(() => finish(harvestApi, tpApi));

commander
    .command("auth")
    .description("authenticate to harvest and targetprocess")
    .action(() => auth(harvestApi, tpApi));

commander
    .on('command:*', () => {
        console.error('Invalid command: %s\nSee --help for a list of available commands.', commander.args.join(' '));
        process.exit(1);
    });

commander.parse(process.argv);

if (commander.args.length === 0) {
	commander.help();
}
