"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tags = void 0;
var TagWithValue_1 = require("./TagWithValue");
var Tags = /** @class */ (function () {
    function Tags(input) {
        this.tags = [];
        if (input === undefined) {
            return;
        }
        // get all @-separated flags, ignoring empty tags
        this.tags = input
            .split("@")
            .map(function (tagPart) { return new TagWithValue_1.TagWithValue(tagPart); })
            .filter(function (tag) { return tag.tag.length > 0; });
    }
    return Tags;
}());
exports.Tags = Tags;
