import { TaskPaperNode } from "./TaskPaperNode";

export function ParseTaskPaper(input: string): TaskPaperNode {
    return new TaskPaperNode(input);
}
