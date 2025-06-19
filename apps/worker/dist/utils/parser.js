"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
function parse(text, values, startDelimiter = "{", endDelimiter = "}") {
    let finalString = "";
    let cursor = 0;
    while (cursor < text.length) {
        const startIndex = text.indexOf(startDelimiter, cursor);
        if (startIndex === -1) {
            // No more templates to parse
            finalString += text.slice(cursor);
            break;
        }
        // Append static text before next template
        finalString += text.slice(cursor, startIndex);
        const endIndex = text.indexOf(endDelimiter, startIndex);
        if (endIndex === -1) {
            // Unmatched opening brace, treat as plain text
            finalString += text.slice(startIndex);
            break;
        }
        const keyPath = text.slice(startIndex + 1, endIndex).trim(); // e.g. "comment.amount"
        const keys = keyPath.split(".");
        let resolved = values;
        try {
            for (const key of keys) {
                if (typeof resolved === "string") {
                    resolved = JSON.parse(resolved);
                }
                resolved = resolved === null || resolved === void 0 ? void 0 : resolved[key];
                if (resolved === undefined)
                    break;
            }
        }
        catch (_a) {
            resolved = undefined;
        }
        finalString += resolved !== undefined ? resolved : `{${keyPath}}`;
        cursor = endIndex + 1;
    }
    return finalString;
}
