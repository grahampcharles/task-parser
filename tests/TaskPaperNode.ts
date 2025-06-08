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
} from "../src/TaskPaperNode";
import { parseTaskPaper } from "../src/index";
import { expect } from "chai";
import "mocha";
import { it } from "mocha";
import {
    taskSimple,
    testDocumentWithMultipleSubprojects,
    todoNoSpaceBetweenProjects,
    todoSimple,
    todoSingleProject,
    todoSpaceBetweenProjects,
} from "./testSource";
import { testSourceLong } from "./testSourceLong";
import {
    testMultilineNotes,
    testRealWorldSource,
    testTwolevelSubprojects,
    testTwolevelSubprojectsSimple,
} from "./testSourceRealWorld";
import { ifError } from "assert";

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
        expect(nodeIsProject("Project With - Hyphens:")).to.equal(true);
        expect(nodeIsProject("Project With: Colons:")).to.equal(true);
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
        expect(nodeIsTask("Stuff Before - Test")).to.equal(false);
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
        expect(nodeIsNote("\t\tThis is a tab-indented note.")).to.equal(true);
        expect(
            nodeIsNote(
                "1. Gielan, M. (2015). Broadcasting happiness: The science of igniting and sustaining positive change. "
            )
        ).to.equal(true);
    });

    it("node is Unknown", () => {
        expect(getNodeType("")).to.equal("unknown");
        expect(getNodeType("\t\t")).to.equal("unknown");
        expect(getNodeType("  \t  \t")).to.equal("unknown");
        expect(getNodeType("                        ")).to.equal("unknown");
        expect(getNodeType("        \nProject on Next Line:")).to.equal(
            "unknown"
        );
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

        expect(getNodeValue("Project With - Hyphens:")).to.equal(
            "Project With - Hyphens"
        );
        expect(getNodeValue("Project With: Colons:")).to.equal(
            "Project With: Colons"
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
        expect(firstItem.parent).to.exist;
        expect(firstItem.parent?.value).to.be.undefined;
    });
});

describe("Real World task source", () => {
    it("parse document", () => {
        const document = new TaskPaperNode(testRealWorldSource);
        expect(document.type).to.equal("document");
    });
});

describe("TaskPaperNode parents", () => {
    it("no parent", () => {
        const task = new TaskPaperNode(taskSimple);
        const parents = task.parents();
        expect(parents).lengthOf(0);
    });

    it("just the document as parent", () => {
        const document = new TaskPaperNode(todoNoSpaceBetweenProjects);
        const project = document.children[0];
        const parents = project.parents();
        expect(parents).lengthOf(0);
    });

    it("project as parent", () => {
        const document = new TaskPaperNode(todoNoSpaceBetweenProjects);
        const project = document.children[0].children[0];
        const parents = project.parents();
        expect(parents).lengthOf(1);
    });

    it("first-level subproject", () => {
        const document = new TaskPaperNode(todoSimple);
        const project = document.children[0].children[3];
        const task = project.children[0];
        const parents = task.parents();
        expect(parents).to.have.length(2);
        const parentNames = parents.map((node) => node.value).join(".");
        expect(parentNames).to.equal("Test Project 1.Test SubProject 1");
    });

    it("multiple subprojects", () => {
        const document = new TaskPaperNode(testDocumentWithMultipleSubprojects);
        const project = document.children[0];
        expect(project).to.have.property("children").of.length(2);
    });
});
describe("TaskPaperNode parsing", () => {

    it("empty node", () => {
        const emptyNode = new TaskPaperNode("");
        expect(emptyNode).to.have.property("type", "unknown");
    });


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
            7
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
        const longDocument = new TaskPaperNode(testSourceLong);

        expect(longDocument.children).to.have.lengthOf(3);
        expect(longDocument).to.have.nested.property(
            "children[1].children[2].value",
            "item #4"
        );
        expect(longDocument).to.have.nested.property(
            "children[1].children[3].tags[1].value",
            "2022-11-01"
        );
        expect(longDocument).to.have.nested.property(
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
            .join(`\n`);
        expect(simple).to.equal(taskSimple);
    });

    it("toString with children, include blank line", () => {
        const node = new TaskPaperNode(todoSpaceBetweenProjects);
        const simple = node.toStringWithChildren(undefined, {
            blankLineAfterProject: true,
        });
        const simpleLines = simple.join(`\n`);
        const expected = todoSpaceBetweenProjects;
        expect(simpleLines).to.equal(expected);
    });

    it("toString with children, only include blank line", () => {
        const simple = new TaskPaperNode(
            "Project 1:\n\tSubproject 1"
        ).toStringWithChildren(undefined, { blankLineAfterProject: true });
        expect(simple.length).to.equal;
    });

    it("toString with children, add blank line", () => {
        const simple = new TaskPaperNode(todoNoSpaceBetweenProjects)
            .toStringWithChildren(undefined, { blankLineAfterProject: true })
            .join(`\n`);
        expect(simple).to.equal(todoSpaceBetweenProjects);
    });

    it("toString with children, remove blank line", () => {
        const node = new TaskPaperNode(todoSpaceBetweenProjects);
        const results = node
            .toStringWithChildren(undefined, { blankLineAfterProject: false })
            .join(`\n`);
        const expectation = todoNoSpaceBetweenProjects;
        expect(results).to.equal(expectation);
    });

    it("toString single project", () => {
        const singleProjectNode = new TaskPaperNode(todoSingleProject);
        const results = singleProjectNode.toStringWithChildren().join(`\n`);
        const expectation = todoSingleProject.trimEnd();
        expect(results).to.equal(expectation);
    });

    it("toString multiple projects", () => {
        const multipleProjectNode = new TaskPaperNode(todoSimple);
        const results = multipleProjectNode.toStringWithChildren().join(`\n`);
        const expectation = todoSimple;
        expect(results).to.equal(expectation);
    });

    it("two-level subprojects, simple", () => {
        const document = new TaskPaperNode(testTwolevelSubprojectsSimple);
        const project = document.children[0];
        const subProject = project.children[0];
        const subsubProject1 = subProject.children[0];
        const subsubProject2 = subProject.children[1];

        expect(document.children).to.have.lengthOf(1, "document");
        expect(project.children).to.have.lengthOf(1, "project");
        expect(subProject.children).to.have.lengthOf(
            2,
            `subProject: ${subProject.children.length}`
        );
        expect(subsubProject1.children).to.have.lengthOf(1, "subsubProject1");
        expect(subsubProject2.children).to.have.lengthOf(1, "subsubProject2");
    });

    it("two-level subprojects, complex", () => {
        const document = new TaskPaperNode(testTwolevelSubprojects);
        const project = document.children[0];
        const subProject = project.children[0];
        const subsubProject1 = subProject.children[0];
        const subsubProject2 = subProject.children[1];

        expect(document.children).to.have.lengthOf(1, "document");
        expect(project.children).to.have.lengthOf(1, "project");
        expect(subProject.children).to.have.lengthOf(
            2,
            `subProject: ${subProject.children.length}`
        );
        expect(subsubProject1.children).to.have.lengthOf(1, "subsubProject1");
        expect(subsubProject2.children).to.have.lengthOf(3, "subsubProject2");
    });

    it("notes", () => {
        const document = new TaskPaperNode(testMultilineNotes);
        const project = document.children[0];

        expect(document.children).to.have.lengthOf(1, "document");
        expect(project.children).to.have.lengthOf(2, "project");
    });

    it("line count", () => {
        const doc1 = new TaskPaperNode(`Project:\n\t-Task`);
        const lineCount1 = doc1.children[0].lineCount();
        expect(lineCount1).to.equal(2);
        const doc2 = new TaskPaperNode(`Project:\n\t-task\n\n\t- task`);
        const lineCount2 = doc2.children[0].lineCount();
        expect(lineCount2).to.equal(3);

        const doc3 = new TaskPaperNode(testTwolevelSubprojects);
        const lineCount3 = doc3.children[0].lineCount();
        expect(lineCount3).to.equal(13);

        const lineCount4 = doc3.children[0].children[0].lineCount();
        expect(lineCount4).to.equal(12);

    });

    it("parseTaskPaper", () => {
        const document = parseTaskPaper(todoSimple);
        expect(document).to.have.property("type").eq("document");
    });
});
