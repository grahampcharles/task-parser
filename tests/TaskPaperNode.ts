import {
    getNodeDepth,
    getNodeTags,
    getNodeType,
    getNodeValue,
    nodeIsDocument,
    nodeIsNote,
    nodeIsProject,
    nodeIsTask,
} from "../src/TaskPaperNode";
import { expect } from "chai";
import "mocha";
import { it } from "mocha";

// Reference:  RegEx tests run at:
// Project: https://regex101.com/r/6wdHCZ/2
// Task: https://regex101.com/r/3Uc5Yg/1
describe("TaskPaperNode parsing", () => {
    it("node is Document", () => {
        expect(nodeIsDocument("Test:\n-item 1")).to.equal(true);
        expect(nodeIsDocument("Test:")).to.equal(false);
    });

    it("node is Project", () => {
        expect(nodeIsProject("Test:")).to.equal(true);
        expect(nodeIsProject("Test:\n-item 1")).to.equal(false);
        expect(nodeIsProject("Test:    ")).to.equal(true, "spaces after");
        expect(nodeIsProject("\tTest:")).to.equal(true, "indented with tab");
        expect(nodeIsProject("  Test:")).to.equal(true, "indented with spaces");
        expect(nodeIsProject("Test: @tag1 @tag2(value)")).to.equal(
            true,
            "with tags"
        );
        expect(nodeIsProject("  Test: @tag1 @tag2(value)")).to.equal(
            true,
            "indented with tags"
        );
        expect(nodeIsProject("- Test:")).to.equal(false);
        expect(nodeIsProject("- Test @tag1, @tag2(value)")).to.equal(false);
        expect(nodeIsProject("  - Test")).to.equal(false);
        expect(nodeIsProject("\t- Test")).to.equal(false);
    });

    it("node is Task", () => {
        expect(nodeIsTask("Test:\n-item 1")).to.equal(false);
        expect(nodeIsTask("Test:")).to.equal(false);
        expect(nodeIsTask("- Test:")).to.equal(true);
        expect(nodeIsTask("- Test @tag1, @tag2(value)")).to.equal(true);
        expect(nodeIsTask("  - Test")).to.equal(true);
        expect(nodeIsTask("\t- Test")).to.equal(true);
    });

    it("node is Note", () => {
        expect(nodeIsNote("Test:\n-item 1")).to.equal(false);
        expect(nodeIsNote("Test:")).to.equal(false);
        expect(nodeIsNote("- Test:")).to.equal(false);
        expect(nodeIsNote("- Test @tag1, @tag2(value)")).to.equal(false);
        expect(nodeIsNote("  - Test")).to.equal(false);
        expect(nodeIsNote("\t- Test")).to.equal(false);
        expect(nodeIsNote("This is a note.")).to.equal(true);
        expect(nodeIsNote("    This is an indented note.")).to.equal(true);
    });

    it("getNodeType", () => {
        expect(getNodeType("Test:\n-item 1")).to.equal("document");

        expect(getNodeType("Test:")).to.equal("project");
        expect(getNodeType("Test:    ")).to.equal("project");
        expect(getNodeType("\tTest:")).to.equal("project");
        expect(getNodeType("  Test:")).to.equal("project");
        expect(getNodeType("Test: @tag1 @tag2(value)")).to.equal("project");
        expect(getNodeType("  Test: @tag1 @tag2(value)")).to.equal("project");

        expect(getNodeType("- Test:")).to.equal("task");
        expect(getNodeType("- Test @tag1, @tag2(value)")).to.equal("task");
        expect(getNodeType("  - Test")).to.equal("task");
        expect(getNodeType("\t- Test")).to.equal("task");

        expect(getNodeType("This is a note.")).to.equal("note");
        expect(getNodeType("  This is a note.")).to.equal("note");
        expect(getNodeType("    This is an indented note.")).to.equal("note");
    });

    it("getNodeDepth", () => {
        expect(getNodeDepth("Test:\n-item 1")).to.equal(0);

        expect(getNodeDepth("Test:")).to.equal(1);
        expect(getNodeDepth("Test:    ")).to.equal(1);

        expect(getNodeDepth("\tTest:")).to.equal(2);
        expect(getNodeDepth("  Test:")).to.equal(2);

        expect(getNodeDepth("- Test:")).to.equal(1);
        expect(getNodeDepth("- Test @tag1, @tag2(value)")).to.equal(1);
        expect(getNodeDepth("  - Test")).to.equal(2);
        expect(getNodeDepth("\t- Test")).to.equal(2);
        expect(getNodeDepth("    - Test")).to.equal(3);
        expect(getNodeDepth("\t\t- Test")).to.equal(3);

        expect(getNodeDepth("This is a note.")).to.equal(1);
        expect(getNodeDepth("  This is a note.")).to.equal(2);
        expect(getNodeDepth("    This is an indented note.")).to.equal(3);
    });

    it("getNodeValue", () => {
        expect(getNodeValue("Test:\n-item 1")).to.equal("");

        expect(getNodeValue("Test:")).to.equal("Test");
        expect(getNodeValue("Test:    ")).to.equal("Test");

        expect(getNodeValue("\tTest:")).to.equal("Test");
        expect(getNodeValue("  Test:")).to.equal("Test");

        expect(getNodeValue("- Test:")).to.equal("Test:");
        expect(getNodeValue("- Test @tag1 @tag2(value)")).to.equal("Test");
        expect(getNodeValue("  - Test")).to.equal("Test");
        expect(getNodeValue("\t- Test")).to.equal("Test");
        expect(getNodeValue("    - Test")).to.equal("Test");
        expect(getNodeValue("\t\t- Test")).to.equal("Test");

        expect(getNodeValue("This is a note.")).to.equal("This is a note.");
        expect(getNodeValue("  This is a note.")).to.equal("This is a note.");
        expect(getNodeValue("    This is an indented note.")).to.equal(
            "This is an indented note."
        );
    });

    it("getNodeTags", () => {
        expect(getNodeTags("Test:\n-item 1")).to.equal("");

        expect(getNodeTags("Test:")).to.equal("");
        expect(getNodeTags("Test: @tag1")).to.equal("@tag1");
        expect(getNodeTags("Test:    ")).to.equal("");

        expect(getNodeTags("- Test:")).to.equal("");
        expect(getNodeTags("- Test @tag1 @tag2(value)")).to.equal(
            "@tag1 @tag2(value)"
        );

        expect(getNodeTags("This is a note.")).to.equal("");
        expect(getNodeTags("This is a note. @pretend I have tags")).to.equal(
            ""
        );
    });
});
