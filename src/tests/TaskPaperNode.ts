import {
    getNodeDepth,
    getNodeTags,
    getNodeType,
    getNodeValue,
    getTagValueArray,
    nodeIsNote,
    nodeIsProject,
    nodeIsRootProject,
    nodeIsTask,
    TaskPaperNode,
} from "../TaskPaperNode";
import { expect } from "chai";
import "mocha";
import { it } from "mocha";
import { taskSimple, todoSimple, todoSingleProject } from "./testSource";
import { testLongSource } from "./testThreeProjectSource";

// Reference:  RegEx tests run at:
// Project: https://regex101.com/r/6wdHCZ/2
// Task: https://regex101.com/r/3Uc5Yg/1

describe("TaskPaperNode types, values", () => {
    it("node is Project", () => {
        expect(nodeIsProject("Test:")).to.equal(true);
        expect(nodeIsProject("Test:\n-item 1\nProject 2:\n")).to.equal(true);
        expect(nodeIsProject("Test:\n-item 1")).to.equal(true);
        expect(
            nodeIsProject("Test: this is a note with a colon inside")
        ).to.equal(false);
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
        expect(nodeIsProject(todoSingleProject)).to.equal(true);
    });

    it("node is Root Project", () => {
        expect(nodeIsRootProject("Test:")).to.equal(true);
        expect(nodeIsRootProject("Test:\n-item 1\nProject 2:\n")).to.equal(
            true
        );
        expect(nodeIsRootProject("Test:\n-item 1")).to.equal(true);
        expect(nodeIsRootProject("Test:    ")).to.equal(true, "spaces after");
        expect(nodeIsRootProject("\tTest:")).to.equal(
            false,
            "indented with tab"
        );
        expect(nodeIsRootProject("  Test:")).to.equal(
            false,
            "indented with spaces"
        );
        expect(nodeIsRootProject("Test: @tag1 @tag2(value)")).to.equal(
            true,
            "with tags"
        );
        expect(nodeIsRootProject("  Test: @tag1 @tag2(value)")).to.equal(
            false,
            "indented with tags"
        );
        expect(nodeIsRootProject("- Test:")).to.equal(false);
        expect(nodeIsRootProject("- Test @tag1, @tag2(value)")).to.equal(false);
        expect(nodeIsRootProject("  - Test")).to.equal(false);
        expect(nodeIsRootProject("\t- Test")).to.equal(false);
        expect(nodeIsRootProject(todoSingleProject)).to.equal(true);
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
        expect(nodeIsNote("Test embedded colon: value")).to.equal(true);
        expect(nodeIsNote("Test:")).to.equal(false);
        expect(nodeIsNote("- Test:")).to.equal(false);
        expect(nodeIsNote("- Test @tag1, @tag2(value)")).to.equal(false);
        expect(nodeIsNote("  - Test")).to.equal(false);
        expect(nodeIsNote("\t- Test")).to.equal(false);
        expect(nodeIsNote("This is a note.")).to.equal(true);
        expect(nodeIsNote("    This is an indented note.")).to.equal(true);
    });

    it("node is Unknown", () => {
        expect(getNodeType("")).to.equal("unknown");
    });

    it("getNodeType", () => {
        expect(getNodeType("Test:\n-item 1")).to.equal("project");

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
        expect(getNodeDepth("Test:\n-item 1\nTest 2:\n-item 2")).to.equal(1);
        expect(getNodeDepth("Test:\n-item 1")).to.equal(1);

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
        expect(getNodeValue("Test:\n-item 1")).to.equal("Test");

        expect(getNodeValue("Test:")).to.equal("Test");
        expect(getNodeValue("Test:    ")).to.equal("Test");

        expect(getNodeValue("\tTest:")).to.equal("Test");
        expect(getNodeValue("  Test:")).to.equal("Test");

        expect(getNodeValue("- Test:")).to.equal("Test:");
        expect(getNodeValue("- Test:\n- Test 2")).to.equal("Test:");
        expect(getNodeValue("- Test @tag1 @tag2(value)")).to.equal("Test");
        expect(getNodeValue("  - Test")).to.equal("Test");
        expect(getNodeValue("\t- Test")).to.equal("Test");
        expect(getNodeValue("    - Test")).to.equal("Test");
        expect(getNodeValue("\t\t- Test")).to.equal("Test");

        expect(getNodeValue("This is a note.")).to.equal("This is a note.");
        expect(getNodeValue("Note: colon")).to.equal("Note: colon");
        expect(getNodeValue("  This is a note.")).to.equal("This is a note.");
        expect(getNodeValue("    This is an indented note.")).to.equal(
            "This is an indented note."
        );
        expect(
            getNodeValue("This is a note.\nThis is a second line.")
        ).to.equal("This is a note.");
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

        expect(
            getNodeTags("- Test\n- Test Next Line @tag1 @tag2(value)")
        ).to.equal("");

        expect(getNodeTags("This is a note.")).to.equal("");
        expect(getNodeTags("This is a note. @pretend I have tags")).to.equal(
            ""
        );
    });

    it("getTagValueArray", () => {
        expect(getTagValueArray("Test:\n-item 1")).to.have.lengthOf(0);
        expect(getTagValueArray("Test:    ")).to.have.lengthOf(0);
        expect(getTagValueArray("- Test:")).to.have.lengthOf(0);
        expect(getTagValueArray("Test:")).to.have.lengthOf(0);
        expect(
            getTagValueArray("- Test\n- Test Next Line @tag1 @tag2(value)")
        ).to.have.lengthOf(0);

        const test0 = getTagValueArray("Test: @tag1")[0];
        expect(test0).to.have.property("tag", "tag1");
        expect(test0).to.have.property("value", undefined);

        const test1 = getTagValueArray("- Test @tag1 @tag2(value)");
        expect(test1).to.have.lengthOf(2);
        expect(test1[0]).to.have.property("tag", "tag1");
        expect(test1[0]).to.have.property("value", undefined);
        expect(test1[1]).to.have.property("tag", "tag2");
        expect(test1[1]).to.have.property("value", "value");
    });
});

describe("TaskPaperNode parent parsing", () => {
    it("node parent analysis", () => {
        // Test Project 1
        const simpleDocument = new TaskPaperNode(todoSimple);
        expect(simpleDocument).to.have.nested.property(
            "children[0].children[2].parent.value",
            "Test Project 1"
        );

        expect(simpleDocument).to.have.nested.property(
            "children[0].children[3].children[0].parent.value",
            "Test SubProject 1"
        );

        const testItem =
            simpleDocument?.children[0]?.children[3]?.children[0] || undefined;
        expect(testItem).to.not.be.undefined;

        expect(simpleDocument)
            .to.have.nested.property("children[0].children[3].children[0]")
            .respondsTo("rootProject");

        // top-level project should have undefined value (it's the document)
        const firstItem = simpleDocument.children[0];
        expect(firstItem).to.have.nested.property("parent.value").that.is
            .undefined;
    });
});

describe("TaskPaperNode parsing", () => {
    it("single task", () => {
        const singleTask = new TaskPaperNode(taskSimple);
        expect(singleTask).to.have.property("type", "task");
        const tags = singleTask.tags;
        expect(tags).to.have.lengthOf(2);
        expect(singleTask.hasTag("due")).to.equal(true);
    });

    it("simple document", () => {
        const simpleDocument = new TaskPaperNode(todoSimple);
        expect(simpleDocument).to.have.property("type", "document");
        expect(simpleDocument.children).to.have.lengthOf(2);

        expect(simpleDocument).to.have.nested.property(
            "children[0].type",
            "project"
        );
        expect(simpleDocument).to.have.nested.property(
            "children[0].value",
            "Test Project 1"
        );
        expect(simpleDocument).to.have.nested.property(
            "children[0].index.line",
            1
        );

        expect(simpleDocument).to.have.nested.property(
            "children[1].value",
            "Test Project 2"
        );
        expect(simpleDocument).to.have.nested.property(
            "children[1].index.line",
            8
        );

        expect(simpleDocument).to.have.nested.property(
            "children[0].children[0].value",
            "test item 1"
        );
        expect(simpleDocument).to.have.nested.property(
            "children[0].children[1].value",
            "test item 2"
        );
        expect(simpleDocument)
            .to.have.nested.property("children[0].children[1].tags")
            .with.lengthOf(1);
        expect(simpleDocument).to.have.nested.property(
            "children[0].children[1].tags[0].tag",
            "tag1"
        );
        expect(simpleDocument).to.have.nested.property(
            "children[0].children[1].tags[0].value",
            undefined
        );
        expect(simpleDocument).to.have.nested.property(
            "children[0].children[2].value",
            "test item 3"
        );
        expect(simpleDocument)
            .to.have.nested.property("children[0].children[2].tags")
            .with.lengthOf(2);
        expect(simpleDocument).to.have.nested.property(
            "children[0].children[2].tags[0].tag",
            "tag1"
        );
        expect(simpleDocument).to.have.nested.property(
            "children[0].children[2].tags[0].value",
            undefined
        );
        expect(simpleDocument).to.have.nested.property(
            "children[0].children[2].tags[1].tag",
            "tag2"
        );
        expect(simpleDocument).to.have.nested.property(
            "children[0].children[2].tags[1].value",
            "value"
        );

        expect(simpleDocument).to.have.nested.property(
            "children[0].children[3].type",
            "project"
        );
        expect(simpleDocument).to.have.nested.property(
            "children[0].children[3].value",
            "Test SubProject 1"
        );
    });

    it("single project document ", () => {
        const singleProjectDocument = new TaskPaperNode(todoSingleProject);
        expect(singleProjectDocument).to.have.property("type", "document");
        expect(singleProjectDocument)
            .to.have.property("children")
            .with.lengthOf(1);

        type testLocation = { location: string; value: any };
        const tests: Array<testLocation> = [
            { location: "children[0].type", value: "project" },
            { location: "children[0].value", value: "Test Project 1" },
            { location: "children[0].index.line", value: 1 },
            { location: "children[0].children[0].type", value: "task" },
            { location: "children[0].children[0].index.line", value: 2 },
            {
                location: "children[0].children[0].value",
                value: "test item 1",
            },
            { location: "children[0].children[1].type", value: "task" },
            {
                location: "children[0].children[1].value",
                value: "test item 2",
            },
            {
                location: "children[0].children[1].tags[0].tag",
                value: "tag1",
            },
            {
                location: "children[0].children[1].tags[0].value",
                value: undefined,
            },
            {
                location: "children[0].children[2].tags[0].tag",
                value: "tag1",
            },
            {
                location: "children[0].children[2].tags[0].value",
                value: undefined,
            },
            {
                location: "children[0].children[2].tags[1].tag",
                value: "tag2",
            },
            {
                location: "children[0].children[2].tags[1].value",
                value: "value",
            },
        ];
        tests.forEach((loc: testLocation) => {
            expect(singleProjectDocument).to.have.nested.property(
                loc.location,
                loc.value
            );
        });
    });

    it("three-project document", () => {
        const longishDocument = new TaskPaperNode(testLongSource);

        expect(longishDocument.children).to.have.lengthOf(3);
        expect(longishDocument).to.have.nested.property(
            "children[1].children[2].value",
            "item #4"
        );
        expect(longishDocument).to.have.nested.property(
            "children[1].children[3].tags[1].value",
            "2022-11-01"
        );
        expect(longishDocument).to.have.nested.property(
            "children[1].children[4].tags[0].tag",
            "recur"
        );
    });
});

describe("TaskPaperNode string conversion", () => {
    it("toString notes", () => {
        expect(new TaskPaperNode("Test Note").toString()).to.equal("Test Note");
        expect(new TaskPaperNode("Note: Colon").toString()).to.equal(
            "Note: Colon"
        );
    });

    it("toString simple", () => {
        const simple = new TaskPaperNode(taskSimple).toString();
        expect(simple).to.equal(taskSimple);
    });

    it("toString with children simple", () => {
        const simple = new TaskPaperNode(taskSimple)
            .toStringWithChildren()
            .join("/n");
        expect(simple).to.equal(taskSimple);
    });

    it("toString single project", () => {
        const singleProject = new TaskPaperNode(todoSingleProject)
            .toStringWithChildren()
            .join("\n");
        expect(singleProject).to.equal(todoSingleProject);
    });

    it("toString multiple projects", () => {
        const document = new TaskPaperNode(todoSimple)
            .toStringWithChildren()
            .join("\n");
        expect(document).to.equal(todoSimple);
    });
});
