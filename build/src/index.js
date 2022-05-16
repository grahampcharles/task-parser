"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTaskPaper = void 0;
var TaskPaperNode_1 = require("./TaskPaperNode");
function parseTaskPaper(input) {
    return new TaskPaperNode_1.TaskPaperNode(input);
}
exports.parseTaskPaper = parseTaskPaper;
