import { DEBUGPRINTS } from "@/config.js"

export function debugWrap(awaitbool = true, func, name = "Function", color = "orange", DEBUGVARIABLE) {
	return async function(...args) {
		if (typeof func !== "function") {
			console.error(`%c debugWrap error: "${name}" is not a function`, `color: ${color};`, func);
			return;
		}
		
		if (DEBUGVARIABLE) console.log(`%c START ${name}()`, `color: ${color}; font-weight: bold`);
		
		let result;
		if (awaitbool)
			result = await func.apply(this, args);
		else
			result = func.apply(this, args);

		if (DEBUGVARIABLE) console.log(`%c END ${name}()`, `color: ${color}; font-weight: bold`);
		
		return result;
	}
}
