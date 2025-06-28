import { DEBUGPRINTS } from "@/config.js"

export function specialPrintFunction(str, color, fontSize = "14px", fontWeight = "bold", fontFamily = "monospace")
{
    if (!DEBUGPRINTS)
        return
    console.log(`%c${str}`, `color: ${color}; font-size: ${fontSize}; font-weight: ${fontWeight}; font-family: ${fontFamily};`);
}
