var _list = [];
var _scriptName = "early-hack-template.js";
var _scriptSize = 2.6;
var _ownerServersPattern = "pc-";
/** @param {NS} ns **/
export async function main(ns) {
	GetAllServersAsList(ns, "home");

	for (let i = 0; i < _list.length; i++) {
		let host = _list[i];
		Hack(ns, host);
		await InstallScript(ns, host);

	}


	// ns.tprintf("ServerList:" + _list);
	ns.tprintf("===>END<===");
}

async function InstallScript(ns, host) {
	try {
		if (!ns.hasRootAccess(host)) {
			ns.tprintf("WARN Could not install service. Host " + host + " NOT hacked");
			return;
		}
		await ns.scp(_scriptName, host);
		let maxRAM = ns.getServerMaxRam(host);
		let usedRAM = ns.getServerUsedRam(host);
		let countThreads = (maxRAM - usedRAM) / _scriptSize | 0;
		if (countThreads > 0) {
			// RUN SCRIPT
			ns.exec(_scriptName, host, countThreads, host);
			// ==============
			ns.tprint("INFO " + host + " threads " + countThreads + " ====>Installed Service<====");
		}
	}
	catch (e) {
		ns.tprintf("ERROR Could not install Service on host " + host + ". Error:" + e);
	}
}

function Hack(ns, host) {
	try {
		if (ns.hasRootAccess(host)) {
			ns.tprintf("WARN Host " + host + " already hacked");
			return;
		}
		if (ns.fileExists("BruteSSH.exe", "home")) {
			ns.brutessh(host);
		}
		if (ns.fileExists("FTPCrack.exe", "home")) {
			ns.ftpcrack(host);
		}
		if (ns.fileExists("relaySMTP.exe", "home")) {
			ns.relaysmtp(host);
		}

		ns.nuke(host);
		ns.tprintf("INFO ===> Host " + host + " hacked<===");
	}
	catch (e) {
		ns.tprintf("ERROR Could not hacked " + host + ". Error:" + e);
	}
}

function GetAllServersAsList(ns, targetHost) {
	// ns.tprintf("GetAllServersAsList - " + targetHost);
	let res = ns.scan(targetHost);
	for (let i = 0; i < res.length; i++) {
		let host = res[i];
		if (_list.includes(host) || host.includes(_ownerServersPattern))
			continue;
		_list.push(host);
		GetAllServersAsList(ns, host);
	}
}
