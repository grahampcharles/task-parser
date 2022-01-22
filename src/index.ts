import { TaskPaperNode } from "./TaskPaperNode";

export function parseTaskPaper(input: string): TaskPaperNode {
    return new TaskPaperNode(input);
}
