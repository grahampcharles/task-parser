import { TagWithValue } from "./TagWithValue";

export class Tags {
    tags: TagWithValue[] = [];

    constructor(input?: string) {
        if (input === undefined) {
            return;
        }

        // get all @-separated flags, ignoring empty tags
        this.tags = input
            .split("@")
            .map((tagPart: string) => new TagWithValue(tagPart))
            .filter((tag: TagWithValue) => tag.tag.length > 0);
    }
}
