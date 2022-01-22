import { listenerCount } from "process";
import { firstLine, splitLines } from "./strings";
import { TagWithValue } from "./TagWithValue";
import { parseTaskPaperNodeType, TaskPaperNodeType } from "./TaskPaperNodeType";
import { TaskPaperIndex } from "./types";

const topLevelProject = /^(?:[^\s]+.*)(?::)(?:.*)/gm;
const project = /(?:[\t ]*)([^\n]+?)(?::)(?:[\t ]*)/;
const task = /^(?:.*- )([^@\n]*)(?:[ \t]+[^@\n ][^\s\n]*)*/;
const taskWithTags = /(?:.*- )(.*)/;
const indent = /^([ \t]*)(?:[^\s].*)/;
const tags = /(?:[^@\n]*[ \t]+)(@.*)/;

/*
 * Parse non-empty tags from a node string.
 */
export function getTagValueArray(input: string): TagWithValue[] {
    return getNodeTags(input)
        .split("@")
        .map((tag: string) => new TagWithValue(tag))
        .filter((tagWithValue: TagWithValue) => tagWithValue.tag.length > 0);
}

/*
 * Extract tag string from a node string.
 */
export function getNodeTags(input: string): string {
    if (nodeIsProject(input) || nodeIsTask(input)) {
        return (tags.exec(firstLine(input)) || ["", ""])[1];
    }
    return "";
}

/*
 * Extract value from a node string.
 */
export function getNodeValue(input: string): string {
    if (nodeIsProject(input)) {
        return (project.exec(firstLine(input)) || ["", ""])[1];
    }
    if (nodeIsTask(input)) {
        // TODO: fix trimEnd kludge
        return (task.exec(firstLine(input)) || ["", ""])[1].trimEnd();
    }

    if (nodeIsNote(input)) {
        return firstLine(input).trimStart();
    }

    return "";
}

/*
 * Extract depth from a node string.
 */
export function getNodeDepth(input: string): number {
    return (
        Math.floor(
            (input.match(indent) || ["", ""])[1].replace(/\t/g, "  ").length / 2
        ) + 1
    );
}

/*
 * Compute type from a node string.
 */
export function getNodeType(input: string): TaskPaperNodeType {
    if (nodeIsProject(input)) return "project";
    if (nodeIsTask(input)) return "task";
    if (nodeIsNote(input)) return "note";
    return "unknown";
}

/*
 * Determine if node is a project.
 */
export function nodeIsProject(input: string): boolean {
    // task is precedent
    if (nodeIsTask(input)) {
        return false;
    }
    return input.match(project) === null ? false : true;
}
/*
 * Determine if node is a top-level project.
 */
export function nodeIsRootProject(input: string): boolean {
    // document and task are precedent
    return nodeIsProject(input) && getNodeDepth(input) === 1;
}

/*
 * Determine if node is a task.
 */
export function nodeIsTask(input: string): boolean {
    return input.match(task) === null ? false : true;
}
/*
 * Determine if node is a note.
 */
export function nodeIsNote(input: string): boolean {
    if (input.trim().length === 0) {
        return false;
    }
    return !(nodeIsProject(input) || nodeIsTask(input));
}

export class TaskPaperNode {
    type: TaskPaperNodeType;
    value?: string;
    children: TaskPaperNode[] = new Array<TaskPaperNode>();
    tags?: TagWithValue[];
    depth: number;
    index: TaskPaperIndex;

    constructor(input: string | TaskPaperNode, lineNumber: number = 0) {
        if (typeof input === "string") {
            // get document type
            this.type = lineNumber === 0 ? "document" : getNodeType(input);

            // set property values, depending on type
            this.depth = this.type === "document" ? 0 : getNodeDepth(input);
            this.tags = ["project", "task"].includes(this.type)
                ? getTagValueArray(input)
                : undefined;
            this.value =
                this.type !== "document" ? getNodeValue(input) : undefined;
            this.index = { line: lineNumber, column: 0 } as TaskPaperIndex;

            // process children
            const lines = splitLines(input);
            if (this.type === "document") {
                lines.forEach((line: string, index: number) => {
                    // find the next project; parse this child only up to there
                    if (nodeIsRootProject(line)) {
                        const endIndex = lines
                            .slice(index + 1)
                            .findIndex((line) => nodeIsRootProject(line));
                        const newNode = new TaskPaperNode(
                            lines
                                .slice(
                                    index,
                                    endIndex === -1 ? undefined : endIndex
                                )
                                .join("\n"),
                            lineNumber + index + 1 // one-based line numbers
                        );
                        this.children.push(newNode);
                    }
                });
            }

            if (this.type === "project") {
                for (
                    let index = 1; // skip the current line
                    index < lines.length;
                    index++
                ) {
                    const newNode = new TaskPaperNode(
                        lines.slice(index).join("\n"),
                        lineNumber + index
                    );

                    if (
                        newNode.type !== "unknown" &&
                        newNode.type !== "note" &&
                        newNode.depth <= this.depth
                    ) {
                        break;
                    }

                    this.children.push(newNode);

                    // update index to account for any consumed sub-children
                    index = newNode.lastLine() - lineNumber;
                }
            }

            // remove unknowns from children
            this.children = this.children.filter(
                (node) => node.type !== "unknown"
            );
            return;
        }

        // deep clone from existing
        this.type = input.type;
        this.depth = input.depth;
        this.value = input.value;
        this.tags = input.tags?.map(
            (tag) => new TagWithValue(tag.tag, tag.value)
        );
        this.index = { line: input.index.line, column: input.index.column };
        this.children = input.children.map((child) => {
            return new TaskPaperNode(child);
        });
    }

    lastLine(): number {
        if (this.children.length > 0) {
            return this.children[this.children.length - 1].lastLine();
        }
        return this.index.line;
    }

    toString(exceptTags?: string[]): string {
        const tags =
            this.tags
                ?.filter(
                    (tag) =>
                        !exceptTags?.some((exceptTag) => tag.tag === exceptTag)
                )
                .map((tag) => tag.toString())
                .join(" ") || "";
        const prefix = `\t`.repeat(this.depth - 1);

        return `${prefix}- ${this.value} ${tags}`.trimEnd();
    }

    tagValue(tagName: string): string | undefined {
        if (this.hasTag(tagName)) {
            return (
                this.tags?.filter((tag) => tag.tag === tagName)[0].value ||
                undefined
            );
        }
        return undefined;
    }

    hasTag(tagNames: string | string[]): boolean {
        if (typeof tagNames === "string") {
            tagNames = [tagNames];
        }
        return this.tags?.some((tag) => tagNames.includes(tag.tag)) ?? false;
    }

    setTag(tagName: string, tagValue: string): void {
        if (this.tags === undefined) {
            this.tags = [new TagWithValue(tagName, tagValue)];
            return;
        }
        const index = this.tags.findIndex((tag) => tag.tag === tagName);
        if (index === -1) {
            // this doesn't push a TagWithValue
            this.tags.push(new TagWithValue(tagName, tagValue));
            return;
        }
        this.tags[index].value = tagValue;
    }

    removeTag(tagName: string | string[]): void {
        if (Array.isArray(tagName)) {
            tagName.forEach((tag) => {
                this.removeTag(tag);
            });
            return;
        }
        this.tags = this.tags?.filter((tag) => tag.tag !== tagName);
    }

    containsItem(nodeToMatch: TaskPaperNode): boolean {
        var match = this.matches(nodeToMatch);

        // check children
        if (!match && this.children.length > 0) {
            match = this.children.some((childNode) =>
                childNode.containsItem(nodeToMatch)
            );
        }
        return match;
    }

    clone(): TaskPaperNode {
        return new TaskPaperNode(this);
    }

    private matches(nodeToMatch: TaskPaperNode): boolean {
        return (
            this.type === "task" &&
            this.value === nodeToMatch.value &&
            this.tagValue("due") === nodeToMatch.tagValue("due")
        );
    }
}
