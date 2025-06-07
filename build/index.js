"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTaskPaper = parseTaskPaper;
var TaskPaperNode_1 = require("./TaskPaperNode");
function parseTaskPaper(input) {
    return new TaskPaperNode_1.TaskPaperNode(input);
}
