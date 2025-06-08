"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskPaperNode = void 0;
exports.parseTaskPaper = parseTaskPaper;
const TaskPaperNode_1 = require("./TaskPaperNode");
var TaskPaperNode_2 = require("./TaskPaperNode");
Object.defineProperty(exports, "TaskPaperNode", { enumerable: true, get: function () { return TaskPaperNode_2.TaskPaperNode; } });
function parseTaskPaper(input) {
    return new TaskPaperNode_1.TaskPaperNode(input);
}
