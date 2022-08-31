import { Tags } from "../src/Tags";
import { expect } from "chai";
import "mocha";

// Reference: RegEx tests run at https://regex101.com/r/MJuKx4
describe("Tags parsing", () => {
    it("no tag", () => {
        const theTags = new Tags("");
        expect(theTags.tags).to.have.lengthOf(0, "length");
    });

    it("whitespace only", () => {
        const theTags = new Tags("     ");
        expect(theTags.tags).to.have.lengthOf(0, "length");
    });

    it("whitespace and tabs", () => {
        const theTags = new Tags("  \t\t  ");
        expect(theTags.tags).to.have.lengthOf(0, "length");
    });

    it("single tag", () => {
        const theTags = new Tags("@tag");
        expect(theTags.tags).to.have.lengthOf(1, "length");
        expect(theTags.tags[0]).to.have.property("tag", "tag");
        expect(theTags.tags[0]).to.have.property("value", undefined);
    });

    it("single tag with value", () => {
        const theTags = new Tags("@tag(test value)");
        expect(theTags.tags).to.have.lengthOf(1, "length");
        expect(theTags.tags[0]).to.have.property("tag", "tag");
        expect(theTags.tags[0]).to.have.property("value", "test value");
    });

    it("two tags", () => {
        const theTags = new Tags("@tag1 @tag2");
        expect(theTags.tags).to.have.lengthOf(2, "length");
        expect(theTags.tags[0]).to.have.property("tag", "tag1");
        expect(theTags.tags[1]).to.have.property("tag", "tag2");
        expect(theTags.tags[0]).to.have.property("value", undefined);
        expect(theTags.tags[1]).to.have.property("value", undefined);
    });

    it("two tags, one value", () => {
        const theTags = new Tags("@tag1(value) @tag2");
        expect(theTags.tags).to.have.lengthOf(2, "length");
        expect(theTags.tags[0]).to.have.property("tag", "tag1");
        expect(theTags.tags[1]).to.have.property("tag", "tag2");
        expect(theTags.tags[0]).to.have.property("value", "value");
        expect(theTags.tags[1]).to.have.property("value", undefined);
    });
});
