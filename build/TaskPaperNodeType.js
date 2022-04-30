"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTaskPaperNodeType = void 0;
function isTaskPaperNodeType(value) {
    var allowedTypes = ["document", "project", "task", "note"];
    return allowedTypes.indexOf(value) !== -1;
}
function parseTaskPaperNodeType(input) {
    return isTaskPaperNodeType(input)
        ? input
        : "unknown";
}
exports.parseTaskPaperNodeType = parseTaskPaperNodeType;
