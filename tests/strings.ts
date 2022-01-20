import { splitLines } from "../src/strings";
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
});
