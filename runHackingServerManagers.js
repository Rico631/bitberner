import { TServer } from "src/models.js";
import * as utils from "src/utils.js"

/** @param {NS} ns **/
export async function main(ns) {
	let script = "hackingServerManager.js"
	let host = "home";
	let hostExcepts = ["home"];
	let scripts = { "hack": "/src/hack.js", "grow": "/src/grow.js", "weaken": "/src/weaken.js" };

	let tServers = utils.getAllTServersAndHackThem(ns);
	TServer.sortByWeight(tServers);
	await utils.copyScriptsToServers(ns, scripts, tServers);


	let servers = tServers
		.filter(x =>
			x.hasRootAccess
			&& x.maxMoney > 0
			&& utils.acceptHackingLvl(ns, x)
			&& !hostExcepts.includes(x.name)
		);

	let part = Math.ceil(servers.length / 2);

	// part = 10;
	let firstHalf = servers.splice(0, part)
	ns.tprintf(`Get ${part} servers: ${firstHalf.map(x => x.name)}`);
	for (let server of firstHalf) {
		try {
			ns.exec(script, host, 1, server.name);
			ns.tprintf("INFO. Started hacking manager with targer server: %s", server.name);
			await ns.sleep(5000);
		} catch (e) {
			ns.tprintf(`ERROR. Couldn't started hacking mamanger. Script: ${script};Host: ${host};Arg: ${server.name}`);
			ns.tprintf(e);
		}

	}
	ns.tprintf("=====>>END<<=====");
}