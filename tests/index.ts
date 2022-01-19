import { hello } from "../src/index";
import { expect } from "chai";
import "mocha";

describe("Setting up testing", function () {
    it("What is the 'it' for?", () => {
        expect(1).to.equal(1);
    });
    it("This is another change!", () => {
        expect(1).to.equal(1);
    });
    it("Does hello do what I want?", () => {
        expect(hello()).to.equal("Hello, world");
    });
    it("Is hello a function?", () => {
        expect(typeof hello).to.equal("function");
    });
});
