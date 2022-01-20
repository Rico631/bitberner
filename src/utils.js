import { TServer } from "/src/models.js"

/** 
 * @param {NS} ns
 * @returns {Array<string>} servers 
**/
export function getAllServers(ns) {
	return getServersRecurs(ns, "home");
}
/** 
 * @param {NS} ns
 * @returns {Array<TServer>} TServer[] 
**/
export function getAllTServers(ns) {
	let servers = getAllServers(ns);
	return TServer.createTServersFromList(ns, servers);
}
/** 
 * @param {NS} ns
 * @returns {Array<TServer>} TServer[] 
**/
export function getAllTServersAndHackThem(ns) {
	let servers = getAllTServers(ns);
	servers.forEach(host => {
		hackServer(ns, host.name);
	});
	return servers;
}
/** 
 * @param {TServer} host 
 * @returns {string} hack, grow, weaken
**/
export function getHackMethod(host) {
	let moneyThresh = host.maxMoney * 0.9;
	let securityThresh = host.minSecurityLevel + 5;
	let securityLevel = host.securityLevel;
	let moneyAvailable = host.moneyAvailable;

	if (securityLevel > securityThresh)
		return "weaken";
	else if (moneyAvailable < moneyThresh)
		return "grow";
	else
		return "hack";
}
/** 
@param {NS} ns
@param {string} host 
**/
export function hackServer(ns, host) {
	if (ns.hasRootAccess(host))
		return;
	let hacks = ["brutessh", "ftpcrack", "relaysmtp", "httpworm", "sqlinject"];
	for (const hack of hacks) {
		if (ns.fileExists(hack + '.exe')) {
			ns[hack](host);
		}
	}
	try {
		ns.nuke(host);
		ns.print("INFO ===> Host " + host + " hacked<===");
	}
	catch (e) {
		ns.print("ERROR Could not hacked " + host);
	}
}
/** 
@param {NS} ns
@param {string} scriprFile
@param {Array<TServer>} servers 
*/
export async function copyScriptsToServers(ns, scripts, servers) {
	for await (const server of servers) {
		for await (const [key, value] of Object.entries(scripts))
			await copyScriptToHost(ns, value, server.name);
	}
}
/** 
@param {NS} ns
@param {string | string[]} scripts
@param {string} host 
*/
export async function copyScriptToHost(ns, scripts, host) {
	try {
		await ns.scp(scripts, host);
	} catch (e) {
		ns.print("ERROR. Could not copy scripts %j on server %s. Exception: %s", scripts, host, e);
	}
}
/** 
@param {NS} ns
@param {Array<TServer>} servers
*/
export function killAllScriptsOnServers(ns, servers) {
	servers.forEach(x => {
		if (x.name == "home") {

		} else {
			x.killAllScripts();
		}
	});
}
/** 
@param {NS} ns
@param {TServer} server
@return {bool}
*/
export function acceptHackingLvl(ns, server) {
	return ns.getHackingLevel() >= server.requiredHackingLevel;
}
/** 
@param {NS} ns
@param {string} script
@param {string} host
@param {number} scriptThreadCount
@param {string[]} args
*/
export function execScript(ns, script, host, scriptThreadCount, args = []) {
	try {
		if (args.length == 0)
			ns.exec(script, host, scriptThreadCount);
		else
			ns.exec(script, host, scriptThreadCount, args);
	} catch (e) {
		ns.print(`ERROR. Couldn't exec script. Script:${script};Host:${host};Threads:${scriptThreadCount};Args:${args}.\r\n${e}`);
	}
}
/**
 * @param {NS} ns 
 * @param {string} host
 * @returns {Array<string>} servers
**/
function getServersRecurs(ns, host, servers = []) {
	servers.push(host);
	ns.scan(host).forEach(s => !servers.includes(s) ? getServersRecurs(ns, s, servers) : null);
	return servers;
}