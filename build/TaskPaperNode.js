"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskPaperNode = void 0;
exports.getTagValueArray = getTagValueArray;
exports.getNodeTags = getNodeTags;
exports.getNodeValue = getNodeValue;
exports.getNodeDepth = getNodeDepth;
exports.getNodeType = getNodeType;
exports.nodeIsProject = nodeIsProject;
exports.nodeIsRootProject = nodeIsRootProject;
exports.nodeIsTask = nodeIsTask;
exports.nodeIsNote = nodeIsNote;
const strings_1 = require("./strings");
const TagWithValue_1 = require("./TagWithValue");
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
function getTagValueArray(input) {
    return getNodeTags(input)
        .split("@")
        .map((tag) => new TagWithValue_1.TagWithValue(tag))
        .filter((tagWithValue) => tagWithValue.tag.length > 0);
}
/*
 * Extract tag string from a node string.
 */
function getNodeTags(input) {
    if (nodeIsProject(input) || nodeIsTask(input)) {
        return (nodePatternMatches.tags.exec((0, strings_1.firstLine)(input)) || ["", ""])[1];
    }
    return "";
}
/*
 * Extract value from a node string.
 */
function getNodeValue(input) {
    if (nodeIsProject(input)) {
        return (nodePatternMatches.project.exec((0, strings_1.firstLine)(input)) || [
            "",
            "",
        ])[1];
    }
    if (nodeIsTask(input)) {
        // TODO: fix trimEnd kludge
        return (nodePatternMatches.task.exec((0, strings_1.firstLine)(input)) || [
            "",
            "",
        ])[1].trimEnd();
    }
    if (nodeIsNote(input)) {
        return (0, strings_1.firstLine)(input).trimStart();
    }
    return "";
}
/*
 * Extract depth from a node string.
 */
function getNodeDepth(input) {
    return (Math.floor((input.match(nodePatternMatches.indent) || ["", ""])[1].replace(/\t/g, "  ").length / 2) + 1);
}
/*
 * Compute type from a node string.
 */
function getNodeType(input) {
    const theFirstLine = (0, strings_1.firstLine)(input);
    if (nodeIsProject(theFirstLine))
        return "project";
    if (nodeIsTask(theFirstLine))
        return "task";
    if (nodeIsNote(theFirstLine))
        return "note";
    return "unknown";
}
/*
 * Determine if node is a project.
 */
function nodeIsProject(input) {
    const theFirstLine = (0, strings_1.firstLine)(input);
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
function nodeIsRootProject(input) {
    const theFirstLine = (0, strings_1.firstLine)(input);
    // document and task are precedent
    return nodeIsProject(theFirstLine) && getNodeDepth(theFirstLine) === 1;
}
/*
 * Determine if node is a task.
 */
function nodeIsTask(input) {
    const theFirstLine = (0, strings_1.firstLine)(input);
    return theFirstLine.match(nodePatternMatches.task) === null ? false : true;
}
/*
 * Determine if node is a note.
 */
function nodeIsNote(input) {
    const theFirstLine = (0, strings_1.firstLine)(input);
    if (theFirstLine.trim().length === 0) {
        return false;
    }
    return !(nodeIsProject(theFirstLine) || nodeIsTask(theFirstLine));
}
class TaskPaperNode {
    constructor(input, lineNumber = 0) {
        var _a;
        this.type = "unknown";
        this.children = new Array();
        this.depth = 0;
        this.index = { line: 0, column: 0 };
        this.parent = undefined; // Ensure root-level node explicitly has parent set
        if (typeof input === "string") {
            /// split into children, removing empty lines
            //const lines = splitLines(input.trimEnd());
            const lines = (0, strings_1.removeEmptyElements)((0, strings_1.splitLines)(input));
            /// skip all blank lines
            const firstNonBlankIndex = 0; // temp
            // const firstNonBlankIndex = firstNonBlank(lines);
            // if (firstNonBlankIndex === -1) {
            // no non-blank lines left
            //     return;
            // }
            /// get node type
            // special case: if this is line 0 of a multi-line node, it's a document
            if (lineNumber === 0 && /\r|\n/.exec(input) !== null) {
                this.type = "document";
            }
            else if (lines.length > 0) {
                this.type = getNodeType(lines[firstNonBlankIndex]);
            }
            // first line of this node's inner content
            const firstChildLine = this.type === "document" ? 0 : firstNonBlankIndex + 1;
            // set property values
            if (!["document", "unknown"].includes(this.type)) {
                this.depth = getNodeDepth(lines[firstNonBlankIndex]);
                this.tags = ["project", "task"].includes(this.type)
                    ? getTagValueArray(lines[firstNonBlankIndex])
                    : undefined;
                this.value = getNodeValue(lines[firstNonBlankIndex]);
                this.index = {
                    line: lineNumber + firstNonBlankIndex,
                    column: 0,
                };
            }
            // DOCUMENT or PROJECT or TASK node types can contain children,
            // so step through and add all children
            if (["document", "project", "task"].includes(this.type)) {
                for (let index = firstChildLine; index < lines.length; index++) {
                    // skip any blanks
                    // if (isWhiteSpace(lines[index])) {
                    //     continue;
                    // }
                    // examine depth and type of next node
                    const depth = getNodeDepth(lines[index]);
                    const type = getNodeType(lines[index]);
                    // Stop adding children if we've moved to a sibling or parent of the tree.
                    // Notes are always children of
                    // whatever is immediately above them, regardless of indentation level.
                    if ((!["note"].includes(type) && depth <= this.depth) ||
                        ["note"].includes(this.type)) {
                        break;
                    }
                    // get the child node
                    const newNode = new TaskPaperNode(lines.slice(index).join("\n"), lineNumber + index + (1 - firstChildLine) // 1-based line numbering
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
        this.tags = (_a = input.tags) === null || _a === void 0 ? void 0 : _a.map((tag) => new TagWithValue_1.TagWithValue(tag.tag, tag.value));
        this.index = { line: input.index.line, column: input.index.column };
        this.children = input.children.map((child) => {
            return new TaskPaperNode(child);
        });
    }
    lastLine() {
        if (this.children.length > 0) {
            return this.children[this.children.length - 1].lastLine();
        }
        return this.index.line;
    }
    // sum of node and all children
    lineCount() {
        if (this.children.length > 0) {
            return this.children.reduce((sum, current) => {
                return sum + current.lineCount();
            }, 1); // initial value 1 to account for the node itself
        }
        return 1; // no children
    }
    rootProject() {
        // step back through the tree to find the root project
        if (this.parent === undefined) {
            return undefined;
        }
        if (this.parent.type === "document") {
            return this.parent;
        }
        return this.parent.rootProject();
    }
    toString(exceptTags, options = defaultToStringOptions) {
        var _a;
        if (this.type === "document") {
            return "";
        }
        const tags = ((_a = this.tags) === null || _a === void 0 ? void 0 : _a.filter((tag) => !(exceptTags === null || exceptTags === void 0 ? void 0 : exceptTags.some((exceptTag) => tag.tag === exceptTag))).map((tag) => tag.toString()).join(" ")) || "";
        const prefix = this.depth > 1 ? `\t`.repeat(this.depth - 1) : "";
        const startMark = this.type === "task" ? "- " : "";
        const endMark = this.type === "project" ? ":" : "";
        return `${prefix}${startMark}${this.value} ${tags}`
            .trimEnd()
            .concat(`${endMark}`);
    }
    toStringWithChildren(exceptTags, options = defaultToStringOptions) {
        var _a;
        let results = new Array();
        // first, pass own value (except document, which doesn't have one)
        if (this.type !== "document") {
            results.push(this.toString(exceptTags, options));
        }
        // then, pass all child values
        (_a = this.children) === null || _a === void 0 ? void 0 : _a.forEach((child) => {
            results.push(...child.toStringWithChildren(exceptTags, options));
        });
        // add a blank line to top-level projects if requested;
        // do not double-add blank lines
        if (options.blankLineAfterProject &&
            this.type === "project" &&
            this.depth === 1) {
            results.push("");
        }
        if (options.blankLineAfterProject && this.type === "document") {
            // remove document last blank line
            results.pop();
        }
        return results;
    }
    tagValue(tagName) {
        var _a;
        if (this.hasTag(tagName)) {
            return (((_a = this.tags) === null || _a === void 0 ? void 0 : _a.filter((tag) => tag.tag === tagName)[0].value) ||
                undefined);
        }
        return undefined;
    }
    hasTag(tagNames) {
        var _a, _b;
        if (typeof tagNames === "string") {
            tagNames = [tagNames];
        }
        return (_b = (_a = this.tags) === null || _a === void 0 ? void 0 : _a.some((tag) => tagNames.includes(tag.tag))) !== null && _b !== void 0 ? _b : false;
    }
    setTag(tagName, tagValue) {
        if (this.tags === undefined) {
            this.tags = [new TagWithValue_1.TagWithValue(tagName, tagValue)];
            return;
        }
        const index = this.tags.findIndex((tag) => tag.tag === tagName);
        if (index === -1) {
            // this doesn't push a TagWithValue
            this.tags.push(new TagWithValue_1.TagWithValue(tagName, tagValue));
            return;
        }
        this.tags[index].value = tagValue;
    }
    removeTag(tagName) {
        var _a;
        if (Array.isArray(tagName)) {
            tagName.forEach((tag) => {
                this.removeTag(tag);
            });
            return;
        }
        this.tags = (_a = this.tags) === null || _a === void 0 ? void 0 : _a.filter((tag) => tag.tag !== tagName);
    }
    containsItem(nodeToMatch) {
        var match = this.matches(nodeToMatch);
        // check children
        if (!match && this.children.length > 0) {
            match = this.children.some((childNode) => childNode.containsItem(nodeToMatch));
        }
        return match;
    }
    clone() {
        return new TaskPaperNode(this);
    }
    parents() {
        var _a;
        const grandparents = ((_a = this.parent) === null || _a === void 0 ? void 0 : _a.parents()) || [];
        return this.parent === undefined || this.parent.type === "document"
            ? grandparents
            : grandparents.concat(this.parent);
    }
    matches(nodeToMatch) {
        return (this.type === "task" &&
            this.value === nodeToMatch.value &&
            this.tagValue("due") === nodeToMatch.tagValue("due"));
    }
}
exports.TaskPaperNode = TaskPaperNode;
