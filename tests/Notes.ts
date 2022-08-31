import { expect } from "chai";
import "mocha";
import { it } from "mocha";
import { nodeIsProject, TaskPaperNode } from "../src/TaskPaperNode";
import { todoWithNotes } from "./testSource";

// describe("Make Notes Node", () => {
//     it("makeNotesNode without parent", () => {
//         const { node, lineCount } = makeNotesNode([
//             "test note line 1",
//             "test note line 2",
//         ]);
//         expect(node?.type).to.equal("note");
//         expect(lineCount).to.equal(2);
//         expect(node?.value).to.equal(`test note line 1\ntest note line 2`);
//     });
// });

describe("Document With No Top-Level Project", () => {
    it("document without top-level project", () => {
        const taskWithANote = `- task\nNotes are here`;
        const parsedNode = new TaskPaperNode(taskWithANote);
        expect(parsedNode.children.length).to.equal(1);
        expect(parsedNode.children[0]).to.haveOwnProperty("type", "task");
    });
});

describe("TaskPaperNode Parsing", () => {
    it("unindented task node becomes project sibling", () => {
        const taskWithANote = `Project:\n- task`;
        const parsedNode = new TaskPaperNode(taskWithANote);
        expect(parsedNode.children.length).to.equal(2);
        expect(parsedNode.children[0]).to.haveOwnProperty("type", "project");
        expect(parsedNode.children[1]).to.haveOwnProperty("type", "task");
    });
});

describe("Notes Parsing", () => {

    it("task node includes its notes", () => {
        const taskWithANote = `Project:\n\t- task\nNotes are here`;
        const parsedNode = new TaskPaperNode(taskWithANote);
        expect(parsedNode.children.length).to.equal(1);
        expect(parsedNode).to.haveOwnProperty("type", "document");
        expect(parsedNode.children[0]).to.haveOwnProperty("type", "project");
        expect(parsedNode.children[0].children[0]).to.haveOwnProperty(
            "type",
            "task"
        );
        expect(
            parsedNode.children[0].children[0].children[0]
        ).to.haveOwnProperty("type", "note");
    });

    it("node is project", () => {
        expect(nodeIsProject(todoWithNotes)).to.equal(true);
    });

    it("node has correct number of children", () => {
        const theProject = new TaskPaperNode(todoWithNotes).children[0];
        const correctNumber = (todoWithNotes.match(/^\s*-/gm) || []).length;
        expect(correctNumber).to.equal(6);
        expect(theProject.children.length).to.equal(correctNumber);
    });

    it("tasks 1 has a notes line", () => {
        const theProject = new TaskPaperNode(todoWithNotes).children[0];
        const theFirstTask = theProject.children[0];
        expect(theFirstTask.children.length).to.equal(1);
    });

    it("tasks have correct number of notes lines", () => {
        const theProject = new TaskPaperNode(todoWithNotes).children[0];

        const lengths = [1, 1, 1, 2, 2, 1];

        lengths.forEach((value, index) => {
            expect(theProject.children[index].children.length).to.equal(value);
        });
    });
});
