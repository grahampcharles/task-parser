import { firstLine, firstNonBlank, isWhiteSpace, removeEmptyElements, splitLines } from "../src/strings";
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

    it("remove empty elements", () => {
        expect(
            removeEmptyElements(splitLines("test\ntest\ntest"))
        ).to.have.lengthOf(3);
        expect(
            removeEmptyElements(splitLines("test\rtest\rtest"))
        ).to.have.lengthOf(3);
        expect(
            removeEmptyElements(splitLines("test\r\ntest\r\ntest"))
        ).to.have.lengthOf(3);
        expect(
            removeEmptyElements(splitLines("test\n\ntest"))
        ).to.have.lengthOf(2);
        expect(
            removeEmptyElements(splitLines("test\r\rtest"))
        ).to.have.lengthOf(2);
        expect(
            removeEmptyElements(splitLines("test\r\n\r\ntest"))
        ).to.have.lengthOf(2);
        expect(
            removeEmptyElements(splitLines("test\n   \ntest"))
        ).to.have.lengthOf(2);
        expect(
            removeEmptyElements(splitLines("test\r   \rtest"))
        ).to.have.lengthOf(2);
        expect(
            removeEmptyElements(splitLines("test\r\n   \r\ntest"))
        ).to.have.lengthOf(2);
        expect(
            removeEmptyElements(splitLines("test\n\t\ntest"))
        ).to.have.lengthOf(2);
        expect(
            removeEmptyElements(splitLines("test\r\t\rtest"))
        ).to.have.lengthOf(2);
        expect(
            removeEmptyElements(splitLines("test\r\n\t\r\ntest"))
        ).to.have.lengthOf(2);
    });

    it("is whitespace", () => {
        expect(isWhiteSpace("\t")).to.eq(true);
        expect(isWhiteSpace("")).to.eq(true);
        expect(isWhiteSpace("test")).to.eq(false);
        expect(isWhiteSpace("\n\r")).to.eq(true);
    })

    it("first non-blank", () => {
        expect(firstNonBlank(["test", "\t"])).to.eq(0);
        expect(firstNonBlank(["\t", "test"])).to.eq(1);
        expect(firstNonBlank(["\t", ""])).to.eq(-1);        
        expect(firstNonBlank([])).to.eq(-1);                
    })

    it("first line", () => {
        expect(firstLine("test\ntest\ntest")).to.equal("test");
        expect(firstLine("test\rtest\rtest")).to.equal("test");
        expect(firstLine("test\r\ntest\r\ntest")).to.equal("test");
        expect(firstLine("test test test")).to.equal("test test test");
        expect(firstLine("")).to.equal("");
    });
});
