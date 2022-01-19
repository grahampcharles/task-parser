export type TaskPaperNodeOld = {
    type: string;
    value?: string;
    children?: TaskPaperNodeOld[];
    tags?: string[];
    depth: number;
    index: TaskPaperIndex;
};
export type TaskPaperIndex = {
    line: number;
    column: number;
};
