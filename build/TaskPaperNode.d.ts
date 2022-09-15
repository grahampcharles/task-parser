import { TagWithValue } from "./TagWithValue";
import { TaskPaperNodeType } from "./TaskPaperNodeType";
import { TaskPaperIndex } from "./types";
export interface ToStringOptions {
    blankLineAfterProject: boolean;
}
export declare function getTagValueArray(input: string): TagWithValue[];
export declare function getNodeTags(input: string): string;
export declare function getNodeValue(input: string): string;
export declare function getNodeDepth(input: string): number;
export declare function getNodeType(input: string): TaskPaperNodeType;
export declare function nodeIsProject(input: string): boolean;
export declare function nodeIsRootProject(input: string): boolean;
export declare function nodeIsTask(input: string): boolean;
export declare function nodeIsNote(input: string): boolean;
export declare class TaskPaperNode {
    type: TaskPaperNodeType;
    value?: string;
    children: TaskPaperNode[];
    tags?: TagWithValue[];
    depth: number;
    index: TaskPaperIndex;
    parent: TaskPaperNode | undefined;
    constructor(input: string | TaskPaperNode, lineNumber?: number);
    lastLine(): number;
    lineCount(): number;
    rootProject(): TaskPaperNode | undefined;
    toString(exceptTags?: string[], options?: ToStringOptions): string;
    toStringWithChildren(exceptTags?: string[], options?: ToStringOptions): string[];
    tagValue(tagName: string): string | undefined;
    hasTag(tagNames: string | string[]): boolean;
    setTag(tagName: string, tagValue: string | undefined): void;
    removeTag(tagName: string | string[]): void;
    containsItem(nodeToMatch: TaskPaperNode): boolean;
    clone(): TaskPaperNode;
    parents(): TaskPaperNode[];
    private matches;
}
