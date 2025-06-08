"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tags = void 0;
const TagWithValue_1 = require("./TagWithValue");
class Tags {
    constructor(input) {
        this.tags = [];
        if (input === undefined) {
            return;
        }
        // get all @-separated flags, ignoring empty tags
        this.tags = input
            .split("@")
            .map((tagPart) => new TagWithValue_1.TagWithValue(tagPart))
            .filter((tag) => tag.tag.length > 0);
    }
}
exports.Tags = Tags;
