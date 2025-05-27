"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
function parse(text, values, startDelimeter = "{", endDelimeter = "}") {
    // You received {comment.amount} moeny from {comment.link}
    let startIndex = 0;
    let endIndex = 0;
    let finalString = "";
    while (endIndex < text.length) {
        if (text[startIndex] === startDelimeter) {
            let startPoint = startIndex + 1;
            let endPoint = startIndex + 2;
            while (text[endPoint] !== endDelimeter) {
                endPoint++;
            }
            let stringHoldingValue = text.slice(startIndex + 1, endPoint);
            const keys = stringHoldingValue.split(".");
            let localValues = Object.assign({}, values);
            console.log(keys);
            for (let i = 0; i < keys.length; i++) {
                if (typeof localValues === "string") {
                    localValues = JSON.parse(localValues);
                }
                localValues = localValues[keys[i]];
            }
            finalString += localValues;
            startIndex = endPoint + 1;
            endIndex = endPoint + 1;
        }
        else {
            finalString += text[startIndex];
            startIndex++;
            endIndex++;
        }
    }
    if (text[startIndex]) {
        finalString += text[startIndex];
    }
    return finalString;
}
