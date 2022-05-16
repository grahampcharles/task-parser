import { TaskPaperNode } from "./src/TaskPaperNode";
import * as testSource from "./tests/testSource";

const document = new TaskPaperNode(testSource.todoSimple)
    .toStringWithChildren()
    .join("\n");

console.log(document);
