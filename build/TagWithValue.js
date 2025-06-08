"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagWithValue = void 0;
class TagWithValue {
    constructor(tag, value) {
        if (value !== undefined) {
            this.tag = tag;
            this.value = value;
            return;
        }
        // match tag(value) or tag or tag()
        const patternMatch = new RegExp(/^(?:[ \t]*)(.*?)(?:[ \t]*)(?:\((.*)\))?(?:[ \t]*)$/gm).exec(tag) || [
            undefined,
            tag, // default to the whole tag if the regexp chokes
            undefined,
        ];
        this.tag = patternMatch[1] || tag.trim();
        this.value = patternMatch[2] || undefined;
    }
    toString() {
        if (this.value === undefined) {
            return `@${this.tag}`;
        }
        return `@${this.tag}(${this.value})`;
    }
}
exports.TagWithValue = TagWithValue;
