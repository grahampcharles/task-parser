import { TaskPaperNode } from "../TaskPaperNode";
import { todoSimple } from "./testSource";

const document = new TaskPaperNode(todoSimple)
    .toStringWithChildren()
    .join("\n");

console.log(document);
