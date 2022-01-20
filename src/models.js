/** @class **/
export class TServer {
	#ns;
	name;
	/** 
	 * @param {NS} ns 
	 * @param {string} name
	**/
	constructor(ns, name) {
		this.#ns = ns;
		this.name = name;
	}
	get hasRootAccess() {
		return this.#ns.hasRootAccess(this.name);
	}
	get maxMoney() {
		return this.#ns.getServerMaxMoney(this.name);
	}
	get minSecurityLevel() {
		return this.#ns.getServerMinSecurityLevel(this.name);
	}
	get securityLevel() {
		return this.#ns.getServerSecurityLevel(this.name);
	}
	get moneyAvailable() {
		return this.#ns.getServerMoneyAvailable(this.name);
	}
	get requiredHackingLevel() {
		return this.#ns.getServerRequiredHackingLevel(this.name);
	}

	/** 
	 * @returns {number} Server weight
	**/
	getWeight() {
		let maxMoney = this.#ns.getServerMaxMoney(this.name);
		let timeSum = this.#ns.getWeakenTime(this.name) + this.#ns.getGrowTime(this.name) + this.#ns.getHackTime(this.name);
		let weight = maxMoney / timeSum;
		return weight;
	}
	getAvailableCountThreadsForScript(script) {
		let scriptRAM = this.#ns.getScriptRam(script);
		let maxRAM = this.#ns.getServerMaxRam(this.name);
		if (this.name == "home")
			maxRAM -= 64;
		let usedRAM = this.#ns.getServerUsedRam(this.name);
		let countThreads = (maxRAM - usedRAM) / scriptRAM | 0;
		return countThreads;
	}
	/** @returns {Object} HackTime, GrowTime, WeakenTime */
	getTimes() {
		return { "hack": this.#ns.getHackTime(this.name), "grow": this.#ns.getGrowTime(this.name), "weaken": this.#ns.getWeakenTime(this.name) };
	}
	getThreadCountToStealALLMoney() {
		return this.getThreadCountToStealMoney(this.moneyAvailable);
	}
	getThreadCountToStealMoney(money) {
		return this.#ns.hackAnalyzeThreads(this.name, money).toFixed();
	}



	killAllScripts() {
		this.#ns.killall(this.name);
	}

	/** 
	 * @param {Array<TServer>} servers
	 * @param {bool} desc Descending
	 * @returns {Array<TServer>} Server weight
	**/
	static sortByWeight(servers, desc = true) {
		servers
			.sort(function (a, b) {
				if (a.getWeight() > b.getWeight())
					return desc ? -1 : 1;
				if (a.getWeight() < b.getWeight())
					return desc ? 1 : -1;
				return 0;
			});
		return servers;
	}
	/**
	 * @param {NS} ns  
	 * @param {Array<string>} servers
	 * @returns {Array<TServer>} Servers
	**/
	static createTServersFromList(ns, servers) {
		return servers.map(x => new TServer(ns, x));
	}
}