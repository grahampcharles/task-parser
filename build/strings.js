"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firstNonBlank = exports.isWhiteSpace = exports.removeEmptyElements = exports.firstLine = exports.splitLines = void 0;
function splitLines(input) {
    return normalizeLineFeeds(input).split("\n");
}
exports.splitLines = splitLines;
function firstLine(input) {
    return normalizeLineFeeds(input).split("\n", 1)[0];
}
exports.firstLine = firstLine;
function normalizeLineFeeds(input) {
    return input.replace(/\r\n/gm, "\n").replace(/\r/gm, "\n");
}
function removeEmptyElements(input) {
    return input.filter(function (line) {
        return !isWhiteSpace(line); // returns true on any non-whitespace found
    });
}
exports.removeEmptyElements = removeEmptyElements;
function isWhiteSpace(input) {
    return !/\S/.test(input);
}
exports.isWhiteSpace = isWhiteSpace;
function firstNonBlank(input) {
    return input.findIndex(function (line) { return !isWhiteSpace(line); });
}
exports.firstNonBlank = firstNonBlank;
