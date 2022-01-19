import { TagWithValue } from "./TagWithValue";
import { TaskPaperIndex } from "./types";

export class TaskPaperNode {
    type: string;
    value?: string;
    children?: TaskPaperNode[];
    tags?: string[];
    tagsParsed?: TagWithValue[];
    depth: number;
    index: TaskPaperIndex;

    constructor(v: TaskPaperNode | string) {
        if (typeof v === "string") {
            this.type = v;
            this.depth = 0;
            this.index = { line: 0, column: 0 } as TaskPaperIndex;
            return;
        }
        this.type = v.type;
        this.value = v.value;
        this.tags = v.tags;
        this.depth = v.depth;
        this.index = v.index;
        this.children = v.children?.map((child) => {
            return new TaskPaperNode(child);
        });

        // parse tags into tag, value pairs
        this.tagsParsed = this.tags?.map((tag) => {
            return new TagWithValue(tag);
        });
    }

    toString(exceptTags?: string[]): string {
        const tags =
            this.tagsParsed
                ?.filter(
                    (tag) =>
                        !exceptTags?.some((exceptTag) => tag.tag === exceptTag)
                )
                .map((tag) => tag.toString())
                .join(" ") || "";
        const prefix = `\t`.repeat(this.depth - 1);

        return `${prefix}- ${this.value} ${tags}`.trimRight();
    }

    tagValue(tagName: string): string | undefined {
        if (this.hasTag(tagName)) {
            return (
                this.tagsParsed?.filter((tag) => tag.tag === tagName)[0]
                    .value || undefined
            );
        }
        return undefined;
    }

    hasTag(tagNames: string | string[]): boolean {
        if (typeof tagNames === "string") {
            tagNames = [tagNames];
        }
        return (
            this.tagsParsed?.some((tag) => tagNames.includes(tag.tag)) ?? false
        );
    }

    setTag(tagName: string, tagValue: string): void {
        if (this.tagsParsed === undefined) {
            this.tagsParsed = [new TagWithValue(tagName, tagValue)];
            return;
        }
        const index = this.tagsParsed.findIndex((tag) => tag.tag === tagName);
        if (index === -1) {
            // this doesn't push a TagWithValue
            this.tagsParsed.push(new TagWithValue(tagName, tagValue));
            return;
        }
        this.tagsParsed[index].value = tagValue;
        this.updateTags();
    }

    removeTag(tagName: string | string[]): void {
        if (Array.isArray(tagName)) {
            tagName.forEach((tag) => {
                this.removeTag(tag);
            });
            return;
        }

        this.tagsParsed = this.tagsParsed?.filter((tag) => tag.tag !== tagName);
        this.updateTags();
    }

    containsItem(nodeToMatch: TaskPaperNode): boolean {
        var match = this.matches(nodeToMatch);

        // check children
        if (!match && this.children !== undefined) {
            match = this.children?.some((childnode) =>
                childnode.containsItem(nodeToMatch)
            );
        }
        return match;
    }

    clone(): TaskPaperNode {
        return new TaskPaperNode(this);
    }

    private matches(nodeToMatch: TaskPaperNode): boolean {
        // TODO: is this enought to a match?
        return (
            this.type === "task" &&
            this.value === nodeToMatch.value &&
            this.tagValue("due") === nodeToMatch.tagValue("due")
        );
    }

    private updateTags(): void {
        this.tags = this.tagsParsed?.map((tag) => {
            if (tag.value === undefined) {
                return tag.tag;
            }
            return `${tag.tag}(${tag.value})`;
        });
    }
}
