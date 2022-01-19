// NOTE: not using Enum to improve JSON readability
export type TaskPaperNodeType =
    | "unknown"
    | "document"
    | "project"
    | "task"
    | "note";

function isTaskPaperNodeType(value: string): value is TaskPaperNodeType {
    const allowedTypes: string[] = ["document", "project", "task", "note"];
    return allowedTypes.indexOf(value) !== -1;
}

export function parseTaskPaperNodeType(input: string): TaskPaperNodeType {
    return isTaskPaperNodeType(input)
        ? (input as TaskPaperNodeType)
        : ("unknown" as TaskPaperNodeType);
}
