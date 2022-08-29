import {
    parseTaskPaperNodeType,
} from "../src/TaskPaperNodeType";
import { expect } from "chai";
import "mocha";

// Reference: RegEx tests run at https://regex101.com/r/MJuKx4
describe("TaskPaperNodeType parsing", () => {
    it("node type", () => {

        const typeTests: [string, string][]  = [
            [ "blah blah", "unknown"],
            [ "project", "project"],
            [ "project:", "unknown"],
        ];

        typeTests.forEach( (typeTest, index ) => 
         {   expect(parseTaskPaperNodeType(typeTest[0])).to.equal(typeTest[1], typeTest[0]);
        })

    });
});
