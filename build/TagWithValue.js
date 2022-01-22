"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagWithValue = void 0;
var TagWithValue = /** @class */ (function () {
    function TagWithValue(tag, value) {
        if (value !== undefined) {
            this.tag = tag;
            this.value = value;
            return;
        }
        // match tag(value) or tag or tag()
        var patternMatch = new RegExp(/^(?:[ \t]*)(.*?)(?:[ \t]*)(?:\((.*)\))?(?:[ \t]*)$/gm).exec(tag) || [
            undefined,
            tag,
            undefined,
        ];
        this.tag = patternMatch[1] || tag.trim();
        this.value = patternMatch[2] || undefined;
    }
    TagWithValue.prototype.toString = function () {
        if (this.value === undefined) {
            return "@".concat(this.tag);
        }
        return "@".concat(this.tag, "(").concat(this.value, ")");
    };
    return TagWithValue;
}());
exports.TagWithValue = TagWithValue;
