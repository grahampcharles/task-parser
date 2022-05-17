import { firstLine, splitLines } from "../strings";
import { expect } from "chai";
import "mocha";

describe("string parsing", () => {
    it("split strings", () => {
        expect(splitLines("test\ntest\ntest")).to.have.lengthOf(3);
        expect(splitLines("test\rtest\rtest")).to.have.lengthOf(3);
        expect(splitLines("test\r\ntest\r\ntest")).to.have.lengthOf(3);
        expect(splitLines("test test test")).to.have.lengthOf(1);
        expect(splitLines("")).to.have.lengthOf(1);
    });

    it("first line", () => {
        expect(firstLine("test\ntest\ntest")).to.equal("test");
        expect(firstLine("test\rtest\rtest")).to.equal("test");
        expect(firstLine("test\r\ntest\r\ntest")).to.equal("test");
        expect(firstLine("test test test")).to.equal("test test test");
        expect(firstLine("")).to.equal("");
    });
});
