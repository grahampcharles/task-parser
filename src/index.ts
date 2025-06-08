import { TaskPaperNode } from "./TaskPaperNode";
export { TaskPaperNode } from './TaskPaperNode';
export type { TaskPaperNodeType } from './TaskPaperNodeType';
export type { TaskPaperIndex } from './types';

export function parseTaskPaper(input: string): TaskPaperNode {
    return new TaskPaperNode(input);
}
