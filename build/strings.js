"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firstLine = exports.splitLines = void 0;
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
