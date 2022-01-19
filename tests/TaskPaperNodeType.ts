import {
    parseTaskPaperNodeType,
    TaskPaperNodeType,
} from "../src/TaskPaperNodeType";
import { expect } from "chai";
import "mocha";

// Reference: RegEx tests run at https://regex101.com/r/MJuKx4
describe("TaskPaperNodeType parsing", () => {
    it("node type", () => {
        expect(parseTaskPaperNodeType("blah blah")).to.equal("unknown");
        expect(parseTaskPaperNodeType("project")).to.equal("project");
    });
});
