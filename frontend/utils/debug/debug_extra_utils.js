
export function specialPrintFunction(DEBUG_PRINT_VARIABLE, str, color, fontSize = "14px", fontWeight = "bold", fontFamily = "monospace")
{
    if (!DEBUG_PRINT_VARIABLE)
        return
    console.log(`%c${str}`, `color: ${color}; font-size: ${fontSize}; font-weight: ${fontWeight}; font-family: ${fontFamily};`);
}
