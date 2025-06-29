import { DEBUGPRINTS } from "@/config.js"


function getTimeStamp() {
	const now = new Date();
	return now.toTimeString().split(" ")[0]; // "HH:MM:SS"
}

export function debugWrap(awaitbool = true, func, name = "Function", color = "orange", DEBUGVARIABLE) {
	return async function(...args) {
		if (typeof func !== "function") {
			console.error(`%c debugWrap error: "${name}" is not a function`, `color: ${color};`, func);
			return;
		}
		
		let time = getTimeStamp();
		if (DEBUGVARIABLE) console.log(`%c[${time}] START ${name}()`, `color: ${color}; font-weight: bold`);
		
		let result;
		if (awaitbool)
			result = await func.apply(this, args);
		else
			result = func.apply(this, args);

		time = getTimeStamp();
		if (DEBUGVARIABLE) console.log(`%c[${time}] END ${name}()`, `color: ${color}; font-weight: bold`);

		return result;
	}
}
