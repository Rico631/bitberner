import { TServer } from "src/models.js";
import * as utils from "src/utils.js"

/** @param {NS} ns **/
export async function main(ns) {
	let targetSrever = ns.args[0];
	// let hostExcepts = ["home"]; // RAM full protection for home
	let hostExcepts = [];
	let scripts = { "hack": "/src/hack.js", "grow": "/src/grow.js", "weaken": "/src/weaken.js" };

	let hackingServer = new TServer(ns, targetSrever);
	let tServers = utils.getAllTServersAndHackThem(ns);
	TServer.sortByWeight(tServers);

	ns.print(`SUCCESS. Server ${hackingServer.name} has been chousen`);

	while (true) {
		ns.print(`INFO. Start hacking server ${hackingServer.name} `);
		let servers = tServers.filter(x => x.hasRootAccess && !hostExcepts.includes(x.name));

		let hackType = utils.getHackMethod(hackingServer);
		let execTime = hackingServer.getTimes()[hackType];
		ns.print(`hackType: ${hackType};execTime: ${execTime}`);
		switch (hackType) {
			case "grow":
				await Grow(ns, hackingServer, servers, scripts);
				break;
			case "weaken":
				await Weaken(ns, hackingServer, servers, scripts);
				break;
			case "hack":
				await Hack(ns, hackingServer, servers, scripts);
				break;
			default:
				ns.print("ERROR. ArgumentOutOfRangeException. %s was out of range.", hackType);
				break;
		}
		let waitTime = execTime + 400;
		ns.print(`INFO. Start wait ${(waitTime / 1000 / 60).toFixed(2)} minutes `);
		await ns.sleep(waitTime);
		ns.print(`INFO. END hacking server ${hackingServer.name} `);
	}
}
/** @param {NS} ns **/
async function Grow(ns, hackingServer, hosts, scripts) {
	ns.print("INFO. Start Growing for server %s ", hackingServer.name);
	let type = "grow";
	let script = scripts[type];

	let mult = hackingServer.maxMoney / (hackingServer.moneyAvailable == 0 ? 1 : hackingServer.moneyAvailable);
	let threadCountToGrow = ns.growthAnalyze(hackingServer.name, mult);
	ns.print(`INFO. threadCountToGrow: ${threadCountToGrow}`);
	for (const host of hosts) {
		if (threadCountToGrow > 0) {
			let scriptThreadCount = host.getAvailableCountThreadsForScript(script);
			if (scriptThreadCount == 0)
				continue;
			// RUN SCRIPT
			utils.execScript(ns, script, host.name, scriptThreadCount, hackingServer.name);
			// ==============
			threadCountToGrow -= scriptThreadCount;
		}
	}
	ns.print(`INFO. End Growing execution for server ${hackingServer.name}`);
}
async function Weaken(ns, hackingServer, hosts, scripts) {
	ns.print(`INFO. Start Weaken for server ${hackingServer.name}`);
	let type = "weaken";
	let script = scripts[type];

/**
weaken
Security decreased on 'n00dles' from 1.100 to 1.050 = 0.05
 */
	let amount = 0.05;
	let threadCountToWeaken = ((hackingServer.securityLevel - hackingServer.minSecurityLevel) / amount).toFixed();
	ns.print(`INFO. threadCountToWeaken: ${threadCountToWeaken}`);
	for (const host of hosts) {
		if (threadCountToWeaken > 0) {
			let scriptThreadCount = host.getAvailableCountThreadsForScript(script);
			if (scriptThreadCount == 0)
				continue;
			// RUN SCRIPT
			utils.execScript(ns, script, host.name, scriptThreadCount, hackingServer.name);
			// ==============
			threadCountToWeaken -= scriptThreadCount;
		}
	}
	ns.print(`INFO. End Weaken execution for server ${hackingServer.name}`);
}
async function Hack(ns, hackingServer, hosts, scripts) {
	ns.print(`INFO. Start Hack for server ${hackingServer.name}`);
	let type = "hack";
	let script = scripts[type];

	let threadCountToHack = hackingServer.getThreadCountToStealALLMoney() + 1;
	ns.print(`INFO. threadCountToHack: ${threadCountToHack}`);
	for (const host of hosts) {
		if (threadCountToHack > 0) {
			let scriptThreadCount = host.getAvailableCountThreadsForScript(script);
			if (scriptThreadCount == 0)
				continue;
			// RUN SCRIPT
			utils.execScript(ns, script, host.name, scriptThreadCount, hackingServer.name);
			// ==============
			threadCountToHack -= scriptThreadCount;
		}
	}
	ns.print(`INFO. End Hack execution for server ${hackingServer.name}`);
}