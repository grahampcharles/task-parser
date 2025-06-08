"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitLines = splitLines;
exports.firstLine = firstLine;
exports.removeEmptyElements = removeEmptyElements;
exports.isWhiteSpace = isWhiteSpace;
exports.firstNonBlank = firstNonBlank;
function splitLines(input) {
    return normalizeLineFeeds(input).split("\n");
}
function firstLine(input) {
    return normalizeLineFeeds(input).split("\n", 1)[0];
}
function normalizeLineFeeds(input) {
    return input.replace(/\r\n/gm, "\n").replace(/\r/gm, "\n");
}
function removeEmptyElements(input) {
    return input.filter((line) => {
        return !isWhiteSpace(line); // returns true on any non-whitespace found
    });
}
function isWhiteSpace(input) {
    return !/\S/.test(input);
}
function firstNonBlank(input) {
    return input.findIndex((line) => !isWhiteSpace(line));
}
