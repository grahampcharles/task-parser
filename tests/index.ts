import { parseTaskPaper } from "../src/index";
import { expect } from "chai";
import "mocha";
import { todoSimple } from "./testSource";

describe("entry point", function () {
    it("parse wrapper", () => {
        const result = parseTaskPaper(todoSimple);
        expect(result.type).to.eql("document");
        expect(result.depth).to.eql(0);
    });
});
