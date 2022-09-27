import {
    splitLines,
    firstLine,
    removeEmptyElements,
    isWhiteSpace,
    firstNonBlank,
} from "./strings";
import { TagWithValue } from "./TagWithValue";
import { TaskPaperNodeType } from "./TaskPaperNodeType";
import { TaskPaperIndex } from "./types";

// regex tests for project: https://regex101.com/r/9et9l4/1

export interface ToStringOptions {
    blankLineAfterProject: boolean;
}
const defaultToStringOptions = {
    blankLineAfterProject: true,
};

const nodePatternMatches = {
    topLevelProject: /^(?:[^\s]+.*)(?::)(?:.*)/gm,
    project: /(?:[\t ]*)([^\n]+?)(?::)(?:[\t ]*)((?=[@].*)|$)/gm,
    task: /^(?:\s*- )([^@\n]*)(?:[ \t]+[^@\n ][^\s\n]*)*/,
    taskWithTags: /(?:.*- )(.*)/,
    indent: /^([ \t]*)(?:[^\s].*)/,
    tags: /(?:[^@\n]*[ \t]+)(@.*)/,
};
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
        return (nodePatternMatches.tags.exec(firstLine(input)) || ["", ""])[1];
    }
    return "";
}

/*
 * Extract value from a node string.
 */
export function getNodeValue(input: string): string {
    if (nodeIsProject(input)) {
        return (nodePatternMatches.project.exec(firstLine(input)) || [
            "",
            "",
        ])[1];
    }
    if (nodeIsTask(input)) {
        // TODO: fix trimEnd kludge
        return (nodePatternMatches.task.exec(firstLine(input)) || [
            "",
            "",
        ])[1].trimEnd();
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
            (input.match(nodePatternMatches.indent) || ["", ""])[1].replace(
                /\t/g,
                "  "
            ).length / 2
        ) + 1
    );
}

/*
 * Compute type from a node string.
 */
export function getNodeType(input: string): TaskPaperNodeType {
    const theFirstLine = firstLine(input);
    if (nodeIsProject(theFirstLine)) return "project";
    if (nodeIsTask(theFirstLine)) return "task";
    if (nodeIsNote(theFirstLine)) return "note";
    return "unknown";
}

/*
 * Determine if node is a project.
 */
export function nodeIsProject(input: string): boolean {
    const theFirstLine = firstLine(input);

    // task is precedent
    if (nodeIsTask(theFirstLine)) {
        return false;
    }
    return theFirstLine.match(nodePatternMatches.project) === null
        ? false
        : true;
}
/*
 * Determine if node is a top-level project.
 */
export function nodeIsRootProject(input: string): boolean {
    const theFirstLine = firstLine(input);
    // document and task are precedent
    return nodeIsProject(theFirstLine) && getNodeDepth(theFirstLine) === 1;
}

/*
 * Determine if node is a task.
 */
export function nodeIsTask(input: string): boolean {
    const theFirstLine = firstLine(input);
    return theFirstLine.match(nodePatternMatches.task) === null ? false : true;
}
/*
 * Determine if node is a note.
 */
export function nodeIsNote(input: string): boolean {
    const theFirstLine = firstLine(input);
    if (theFirstLine.trim().length === 0) {
        return false;
    }
    return !(nodeIsProject(theFirstLine) || nodeIsTask(theFirstLine));
}

export class TaskPaperNode {
    type: TaskPaperNodeType = "unknown";
    value?: string;
    children: TaskPaperNode[] = new Array<TaskPaperNode>();
    tags?: TagWithValue[];
    depth: number = 0;
    index: TaskPaperIndex = { line: 0, column: 0 };
    parent: TaskPaperNode | undefined;

    constructor(input: string | TaskPaperNode, lineNumber: number = 0) {
        if (typeof input === "string") {
            //// split into children, removing empty lines
            //const lines = splitLines(input.trimEnd());
            const lines = removeEmptyElements(splitLines(input));

            //// skip all blank lines
            const firstNonBlankIndex = 0;       // temp
            // const firstNonBlankIndex = firstNonBlank(lines);
            // if (firstNonBlankIndex === -1) {
            //     // no non-blank lines left
            //     return;
            // }

            //// get node type
            // special case: if this is line 0 of a multi-line node, it's a document
            if (lineNumber === 0 && /\r|\n/.exec(input) !== null) {
                this.type = "document";
            } else {
                this.type = getNodeType(lines[firstNonBlankIndex]);
            }

            // first line of this node's inner content
            const firstChildLine =
                this.type === "document" ? 0 : firstNonBlankIndex + 1;

            // set property values
            if (this.type !== "document") {
                this.depth = getNodeDepth(lines[firstNonBlankIndex]);
                this.tags = ["project", "task"].includes(this.type)
                    ? getTagValueArray(lines[firstNonBlankIndex])
                    : undefined;
                this.value = getNodeValue(lines[firstNonBlankIndex]);
                this.index = {
                    line: lineNumber + firstNonBlankIndex,
                    column: 0,
                } as TaskPaperIndex;
            }

            // DOCUMENT or PROJECT or TASK node types can contain children,
            // so step through and add all children
            if (["document", "project", "task"].includes(this.type)) {
                for (
                    let index = firstChildLine;
                    index < lines.length;
                    index++
                ) {
                    // // skip any blanks
                    // if (isWhiteSpace(lines[index])) {
                    //     continue;
                    // }

                    // examine depth and type of next node
                    const depth = getNodeDepth(lines[index]);
                    const type = getNodeType(lines[index]);

                    // Stop adding children if we've moved to a sibling or parent of the tree.
                    // Notes are always children of
                    // whatever is immediately above them, regardless of indentation level.
                    if (
                        (!["note"].includes(type) && depth <= this.depth) ||
                        ["note"].includes(this.type)
                    ) {
                        break;
                    }

                    // get the child node
                    const newNode = new TaskPaperNode(
                        lines.slice(index).join("\n"),
                        lineNumber + index + (1 - firstChildLine) // 1-based line numbering
                    );

                    // push child onto stack
                    newNode.parent = this;
                    this.children.push(newNode);

                    // update index to account for any consumed children
                    index = index + newNode.lineCount() - 1;
                }
            }

            return;
        }

        // deep clone from existing
        this.type = input.type;
        this.depth = input.depth;
        this.value = input.value;
        this.parent = input.parent;
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

    // sum of node and all children
    lineCount(): number {
        if (this.children.length > 0) {
            return this.children.reduce((sum, current) => {
                return sum + current.lineCount();
            }, 1); // initial value 1 to account for the node itself
        }
        return 1; // no children
    }

    rootProject(): TaskPaperNode | undefined {
        // step back through the tree to find the root project
        if (this.parent === undefined) {
            return undefined;
        }
        if (this.parent.type === "document") {
            return this.parent;
        }
        return this.parent.rootProject();
    }

    toString(
        exceptTags?: string[],
        options: ToStringOptions = defaultToStringOptions
    ): string {
        if (this.type === "document") {
            return "";
        }

        const tags =
            this.tags
                ?.filter(
                    (tag) =>
                        !exceptTags?.some((exceptTag) => tag.tag === exceptTag)
                )
                .map((tag) => tag.toString())
                .join(" ") || "";

        const prefix = this.depth > 1 ? `\t`.repeat(this.depth - 1) : "";
        const startMark = this.type === "task" ? "- " : "";
        const endMark = this.type === "project" ? ":" : "";

        return `${prefix}${startMark}${this.value} ${tags}`
            .trimEnd()
            .concat(`${endMark}`);
    }

    toStringWithChildren(
        exceptTags?: string[],
        options: ToStringOptions = defaultToStringOptions
    ): string[] {
        let results = new Array<string>();

        // first, pass own value (except document, which doesn't have one)
        if (this.type !== "document") {
            results.push(this.toString(exceptTags, options));
        }

        // then, pass all child values
        this.children?.forEach((child) => {
            results.push(...child.toStringWithChildren(exceptTags, options));
        });

        // add a blank line to top-level projects if requested;
        // do not double-add blank lines
        if (
            options.blankLineAfterProject &&
            this.type === "project" &&
            this.depth === 1
        ) {
            results.push("");
        }

        if (options.blankLineAfterProject && this.type === "document") {
            // remove document last blank line
            results.pop();
        }

        return results;
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

    setTag(tagName: string, tagValue: string | undefined): void {
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

    parents(): TaskPaperNode[] {
        const grandparents = this.parent?.parents() || [];
        return this.parent === undefined || this.parent.type === "document"
            ? grandparents
            : grandparents.concat(this.parent);
    }

    private matches(nodeToMatch: TaskPaperNode): boolean {
        return (
            this.type === "task" &&
            this.value === nodeToMatch.value &&
            this.tagValue("due") === nodeToMatch.tagValue("due")
        );
    }
}
