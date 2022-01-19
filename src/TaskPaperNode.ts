import { TagWithValue } from "./TagWithValue";
import { parseTaskPaperNodeType, TaskPaperNodeType } from "./TaskPaperNodeType";
import { TaskPaperIndex } from "./types";

const project = /(?:[\t ]*)([^\n]+?)(?::)(?:[\t ]*)/;
const task = /(?:.*- )([^@\n]*)(?:[ \t]+[^@\n ][^\s\n]*)*/;
const taskWithTags = /(?:.*- )(.*)/;
const indent = /^([ \t]*)(?:[^\s].*)/;
const tags = /(?:[^@\n]*[ \t]+)(@.*)/;

export function parseTaskPaperNode(input: string, lineNumber: number) {
    const type = getNodeType(input);
    const depth = getNodeDepth(input);
    const value = getNodeValue(input);
    const tags = getNodeTags(input);
}

export function getNodeTags(input: string): string {
    if (nodeIsProject(input) || nodeIsTask(input)) {
        return (tags.exec(input) || ["", ""])[1];
    }
    return "";
}

export function getNodeValue(input: string): string {
    if (nodeIsDocument(input)) {
        return "";
    }
    if (nodeIsProject(input)) {
        return (project.exec(input) || ["", ""])[1];
    }
    if (nodeIsTask(input)) {
        // TODO: fix trimEnd kludge
        return (task.exec(input) || ["", ""])[1].trimEnd();
    }

    if (nodeIsNote(input)) {
        return input.trimStart();
    }

    return "";
}

export function getNodeDepth(input: string): number {
    if (nodeIsDocument(input)) {
        return 0;
    }

    return (
        Math.floor(
            (input.match(indent) || ["", ""])[1].replace(/\t/g, "  ").length / 2
        ) + 1
    );
}

export function getNodeType(input: string): TaskPaperNodeType {
    if (nodeIsDocument(input)) return "document";
    if (nodeIsProject(input)) return "project";
    if (nodeIsTask(input)) return "task";
    if (nodeIsNote(input)) return "note";
    return "unknown";
}
export function nodeIsDocument(input: string): boolean {
    return input.indexOf("\r") !== -1 || input.indexOf("\n") !== -1;
}
export function nodeIsProject(input: string): boolean {
    // task is precedent
    if (nodeIsTask(input) || nodeIsDocument(input)) {
        return false;
    }
    return input.match(project) === null ? false : true;
}
export function nodeIsTask(input: string): boolean {
    if (nodeIsDocument(input)) {
        return false;
    }
    return input.match(task) === null ? false : true;
}
export function nodeIsNote(input: string): boolean {
    if (input.trim().length === 0) {
        return false;
    }
    return !(
        nodeIsDocument(input) ||
        nodeIsProject(input) ||
        nodeIsTask(input)
    );
}

export class TaskPaperNode {
    type: TaskPaperNodeType;
    value?: string;
    children?: TaskPaperNode[];
    tags?: TagWithValue[];
    depth: number;
    index: TaskPaperIndex;

    constructor(v: TaskPaperNode) {
        this.type = v.type;
        this.value = v.value;
        this.tags = v.tags;
        this.depth = v.depth;
        this.index = v.index;
        this.children = v.children?.map((child) => {
            return new TaskPaperNode(child);
        });
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
        if (!match && this.children !== undefined) {
            match = this.children?.some((childNode) =>
                childNode.containsItem(nodeToMatch)
            );
        }
        return match;
    }

    clone(): TaskPaperNode {
        return new TaskPaperNode(this);
    }

    private matches(nodeToMatch: TaskPaperNode): boolean {
        // TODO: is this enough to do the match?
        return (
            this.type === "task" &&
            this.value === nodeToMatch.value &&
            this.tagValue("due") === nodeToMatch.tagValue("due")
        );
    }
}
