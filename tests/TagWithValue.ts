import { TagWithValue } from "../src/TagWithValue";
import { expect } from "chai";
import "mocha";

// Reference: RegEx tests run at https://regex101.com/r/MJuKx4
describe("TagWithValue parsing", () => {
    it("tag with a value", () => {
        const theTagValue = new TagWithValue("tag(value)");
        expect(theTagValue).to.have.property("tag").equal("tag");
        expect(theTagValue).to.have.property("value").equal("value");
    });

    it("tag with a value, spaces within", () => {
        const theTagValue = new TagWithValue("tag(a value)");
        expect(theTagValue).to.have.property("tag").equal("tag");
        expect(theTagValue).to.have.property("value").equal("a value");
    });

    it("tag with no value", () => {
        const theTagValue = new TagWithValue("tag");
        expect(theTagValue).to.have.property("tag").equal("tag");
        expect(theTagValue).to.have.property("value").to.be.undefined;
    });

    it("tag with leading spaces", () => {
        const theTagValue = new TagWithValue("   tag");
        expect(theTagValue).to.have.property("tag").equal("tag");
        expect(theTagValue).to.have.property("value").to.be.undefined;
    });

    it("tag with trailing spaces", () => {
        const theTagValue = new TagWithValue("tag   ");
        expect(theTagValue).to.have.property("tag").equal("tag");
        expect(theTagValue).to.have.property("value").to.be.undefined;
    });

    it("tag with leading tab character", () => {
        const theTagValue = new TagWithValue("\ttag");
        expect(theTagValue).to.have.property("tag").equal("tag");
        expect(theTagValue).to.have.property("value").to.be.undefined;
    });
});
