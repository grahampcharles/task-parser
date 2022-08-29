import { Tags } from "../Tags";
import { expect } from "chai";
import "mocha";
import { TaskPaperNode } from "../TaskPaperNode";

// Reference: RegEx tests run at https://regex101.com/r/MJuKx4
describe("Tag manipulation", () => {
    it("setTag", () => {
        const SOURCE_NODE = "Test item @tag1 @tag2(value)";
        const theNode = new TaskPaperNode(SOURCE_NODE);

        theNode.setTag("newTag", undefined);
        expect(theNode.hasTag("newTag")).to.be.true;
        expect(theNode.toString()).to.equal(`${SOURCE_NODE} @newTag`);

        theNode.setTag("newTag", "");
        expect(theNode.hasTag("newTag")).to.be.true;
        expect(theNode.toString()).to.equal(`${SOURCE_NODE} @newTag()`);

        theNode.setTag("newTag", "testValue");
        expect(theNode.hasTag("newTag")).to.be.true;
        expect(theNode.toString()).to.equal(
            `${SOURCE_NODE} @newTag(testValue)`
        );
    });
});
