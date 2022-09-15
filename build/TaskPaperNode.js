"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskPaperNode = exports.nodeIsNote = exports.nodeIsTask = exports.nodeIsRootProject = exports.nodeIsProject = exports.getNodeType = exports.getNodeDepth = exports.getNodeValue = exports.getNodeTags = exports.getTagValueArray = void 0;
var strings_1 = require("./strings");
var TagWithValue_1 = require("./TagWithValue");
var defaultToStringOptions = {
    blankLineAfterProject: true,
};
var nodePatternMatches = {
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
        .map(function (tag) { return new TagWithValue_1.TagWithValue(tag); })
        .filter(function (tagWithValue) { return tagWithValue.tag.length > 0; });
}
exports.getTagValueArray = getTagValueArray;
/*
 * Extract tag string from a node string.
 */
function getNodeTags(input) {
    if (nodeIsProject(input) || nodeIsTask(input)) {
        return (nodePatternMatches.tags.exec((0, strings_1.firstLine)(input)) || ["", ""])[1];
    }
    return "";
}
exports.getNodeTags = getNodeTags;
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
exports.getNodeValue = getNodeValue;
/*
 * Extract depth from a node string.
 */
function getNodeDepth(input) {
    return (Math.floor((input.match(nodePatternMatches.indent) || ["", ""])[1].replace(/\t/g, "  ").length / 2) + 1);
}
exports.getNodeDepth = getNodeDepth;
/*
 * Compute type from a node string.
 */
function getNodeType(input) {
    var theFirstLine = (0, strings_1.firstLine)(input);
    if (nodeIsProject(theFirstLine))
        return "project";
    if (nodeIsTask(theFirstLine))
        return "task";
    if (nodeIsNote(theFirstLine))
        return "note";
    return "unknown";
}
exports.getNodeType = getNodeType;
/*
 * Determine if node is a project.
 */
function nodeIsProject(input) {
    var theFirstLine = (0, strings_1.firstLine)(input);
    // task is precedent
    if (nodeIsTask(theFirstLine)) {
        return false;
    }
    return theFirstLine.match(nodePatternMatches.project) === null
        ? false
        : true;
}
exports.nodeIsProject = nodeIsProject;
/*
 * Determine if node is a top-level project.
 */
function nodeIsRootProject(input) {
    var theFirstLine = (0, strings_1.firstLine)(input);
    // document and task are precedent
    return nodeIsProject(theFirstLine) && getNodeDepth(theFirstLine) === 1;
}
exports.nodeIsRootProject = nodeIsRootProject;
/*
 * Determine if node is a task.
 */
function nodeIsTask(input) {
    var theFirstLine = (0, strings_1.firstLine)(input);
    return theFirstLine.match(nodePatternMatches.task) === null ? false : true;
}
exports.nodeIsTask = nodeIsTask;
/*
 * Determine if node is a note.
 */
function nodeIsNote(input) {
    var theFirstLine = (0, strings_1.firstLine)(input);
    if (theFirstLine.trim().length === 0) {
        return false;
    }
    return !(nodeIsProject(theFirstLine) || nodeIsTask(theFirstLine));
}
exports.nodeIsNote = nodeIsNote;
var TaskPaperNode = /** @class */ (function () {
    function TaskPaperNode(input, lineNumber) {
        if (lineNumber === void 0) { lineNumber = 0; }
        var _a;
        this.children = new Array();
        if (typeof input === "string") {
            //// split into children
            var lines = (0, strings_1.splitLines)(input);
            //// get node type
            // special case: if this is line 0 of a multi-line node, it's a document
            if (lineNumber === 0 && /\r|\n/.exec(input) !== null) {
                this.type = "document";
            }
            else {
                this.type = getNodeType(lines[0]);
            }
            // first line of this node's inner content
            var firstChildLine = this.type === "document" ? 0 : 1;
            // set property values, depending on type
            this.depth = this.type === "document" ? 0 : getNodeDepth(input);
            this.tags = ["project", "task"].includes(this.type)
                ? getTagValueArray(input)
                : undefined;
            this.value =
                this.type !== "document" ? getNodeValue(input) : undefined;
            this.index = { line: lineNumber, column: 0 };
            // DOCUMENT or PROJECT or TASK node types can contain children,
            // so step through and add all children
            if (["document", "project", "task"].includes(this.type)) {
                for (var index = firstChildLine; index < lines.length; index++) {
                    var newNode = new TaskPaperNode(lines.slice(index).join("\n"), lineNumber + index + (1 - firstChildLine) // 1-based line numbering
                    );
                    // Stop adding children if we've moved to a sibling or parent of the tree.
                    // Notes nodes are always children of whatever is immediately above them
                    // regardless of indentation level.
                    if (newNode.type !== "note" &&
                        newNode.depth <= this.depth) {
                        break;
                    }
                    // push child onto stack, ignoring unknowns (which is whitespace)
                    if (newNode.type !== "unknown") {
                        newNode.parent = this;
                        this.children.push(newNode);
                    }
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
        this.tags = (_a = input.tags) === null || _a === void 0 ? void 0 : _a.map(function (tag) { return new TagWithValue_1.TagWithValue(tag.tag, tag.value); });
        this.index = { line: input.index.line, column: input.index.column };
        this.children = input.children.map(function (child) {
            return new TaskPaperNode(child);
        });
    }
    TaskPaperNode.prototype.lastLine = function () {
        if (this.children.length > 0) {
            return this.children[this.children.length - 1].lastLine();
        }
        return this.index.line;
    };
    // sum of node and all children
    TaskPaperNode.prototype.lineCount = function () {
        if (this.children.length > 0) {
            return this.children.reduce(function (sum, current) {
                return sum + current.lineCount();
            }, 1); // initial value 1 to account for the node itself
        }
        return 1; // no children
    };
    TaskPaperNode.prototype.rootProject = function () {
        // step back through the tree to find the root project
        if (this.parent === undefined) {
            return undefined;
        }
        if (this.parent.type === "document") {
            return this.parent;
        }
        return this.parent.rootProject();
    };
    TaskPaperNode.prototype.toString = function (exceptTags, options) {
        var _a;
        if (options === void 0) { options = defaultToStringOptions; }
        if (this.type === "document") {
            return "";
        }
        var tags = ((_a = this.tags) === null || _a === void 0 ? void 0 : _a.filter(function (tag) {
            return !(exceptTags === null || exceptTags === void 0 ? void 0 : exceptTags.some(function (exceptTag) { return tag.tag === exceptTag; }));
        }).map(function (tag) { return tag.toString(); }).join(" ")) || "";
        var prefix = this.depth > 1 ? "\t".repeat(this.depth - 1) : "";
        var startMark = this.type === "task" ? "- " : "";
        var endMark = this.type === "project" ? ":" : "";
        return "".concat(prefix).concat(startMark).concat(this.value, " ").concat(tags)
            .trimEnd()
            .concat("".concat(endMark));
    };
    TaskPaperNode.prototype.toStringWithChildren = function (exceptTags, options) {
        var _a;
        if (options === void 0) { options = defaultToStringOptions; }
        var results = new Array();
        // first, pass own value (except document, which doesn't have one)
        if (this.type !== "document") {
            results.push(this.toString(exceptTags, options));
        }
        // then, pass all child values
        (_a = this.children) === null || _a === void 0 ? void 0 : _a.forEach(function (child) {
            results.push.apply(results, child.toStringWithChildren(exceptTags, options));
        });
        // add a blank line to projects if requested;
        // do not double-add blank lines
        if (options.blankLineAfterProject && this.type === "project") {
            if (results[results.length - 1] !== "") {
                results.push("");
            }
        }
        return results;
    };
    TaskPaperNode.prototype.tagValue = function (tagName) {
        var _a;
        if (this.hasTag(tagName)) {
            return (((_a = this.tags) === null || _a === void 0 ? void 0 : _a.filter(function (tag) { return tag.tag === tagName; })[0].value) ||
                undefined);
        }
        return undefined;
    };
    TaskPaperNode.prototype.hasTag = function (tagNames) {
        var _a, _b;
        if (typeof tagNames === "string") {
            tagNames = [tagNames];
        }
        return (_b = (_a = this.tags) === null || _a === void 0 ? void 0 : _a.some(function (tag) { return tagNames.includes(tag.tag); })) !== null && _b !== void 0 ? _b : false;
    };
    TaskPaperNode.prototype.setTag = function (tagName, tagValue) {
        if (this.tags === undefined) {
            this.tags = [new TagWithValue_1.TagWithValue(tagName, tagValue)];
            return;
        }
        var index = this.tags.findIndex(function (tag) { return tag.tag === tagName; });
        if (index === -1) {
            // this doesn't push a TagWithValue
            this.tags.push(new TagWithValue_1.TagWithValue(tagName, tagValue));
            return;
        }
        this.tags[index].value = tagValue;
    };
    TaskPaperNode.prototype.removeTag = function (tagName) {
        var _this = this;
        var _a;
        if (Array.isArray(tagName)) {
            tagName.forEach(function (tag) {
                _this.removeTag(tag);
            });
            return;
        }
        this.tags = (_a = this.tags) === null || _a === void 0 ? void 0 : _a.filter(function (tag) { return tag.tag !== tagName; });
    };
    TaskPaperNode.prototype.containsItem = function (nodeToMatch) {
        var match = this.matches(nodeToMatch);
        // check children
        if (!match && this.children.length > 0) {
            match = this.children.some(function (childNode) {
                return childNode.containsItem(nodeToMatch);
            });
        }
        return match;
    };
    TaskPaperNode.prototype.clone = function () {
        return new TaskPaperNode(this);
    };
    TaskPaperNode.prototype.parents = function () {
        var _a;
        var grandparents = ((_a = this.parent) === null || _a === void 0 ? void 0 : _a.parents()) || [];
        return (this.parent === undefined || this.parent.type === "document") ? grandparents : grandparents.concat(this.parent);
    };
    TaskPaperNode.prototype.matches = function (nodeToMatch) {
        return (this.type === "task" &&
            this.value === nodeToMatch.value &&
            this.tagValue("due") === nodeToMatch.tagValue("due"));
    };
    return TaskPaperNode;
}());
exports.TaskPaperNode = TaskPaperNode;
