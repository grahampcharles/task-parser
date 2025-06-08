# TaskPaperNode Parser Specification

This document outlines the expected behavior of the `TaskPaperNode` parser, including valid input formats, node types, parsing rules, and output structure.

---

## Overview

The parser converts TaskPaper-formatted plain text into a tree of `TaskPaperNode` objects. Each node represents a meaningful item in a task document, such as a **project**, **task**, or **note**. Nodes track their type, indentation depth, tags, and hierarchy.

---

## Supported Node Types

Each line in the input is parsed into one of the following node types:

| Type       | Identifier                             | Description                     |
| ---------- | -------------------------------------- | ------------------------------- |
| `document` | Entire input if multi-line and root    | Root node containing all others |
| `project`  | Line ending in a colon `:`             | Represents a project or section |
| `task`     | Line starting with `- `                | Represents an actionable task   |
| `note`     | Line with no special formatting        | A freeform note or description  |
| `unknown`  | Line that doesn’t match any known type | Fallback value                  |

---

## Input Format Rules

* **Indentation**

  * Indentation is measured in levels. Each level equals **2 spaces** or **1 tab**.
  * Indentation defines hierarchy: indented lines become children of the nearest parent with shallower indentation.
  * Projects and tasks can have child nodes. Notes are always terminal.

* **Tags**

  * Tags begin with `@` and are placed at the end of a line.
    Example: `- task @due(2024-01-01) @priority(high)`
  * Tags are parsed into key-value pairs, e.g., `@due(2024-01-01)` → `{ tag: "due", value: "2024-01-01" }`.

---

## Example Input

```text
Project A:
- First task @done
\tA note about the task
- Second task @due(2024-01-01)

Project B:
- Third task
```

---

## Parsed Output Structure

The parser will produce a `TaskPaperNode` of type `document`, with child nodes representing the lines above in a tree-like structure. Each `TaskPaperNode` contains:

* `type`: One of the defined types
* `value`: String content (without tags)
* `tags`: Array of `TagWithValue`
* `depth`: Integer depth based on indentation
* `children`: Nested `TaskPaperNode` array
* `index`: `{ line, column }` position in the original input
* `parent`: Reference to parent `TaskPaperNode` or `undefined`

---

## Example Output (Partial Tree)

```ts
{
  type: "document",
  children: [
    {
      type: "project",
      value: "Project A",
      depth: 1,
      children: [
        {
          type: "task",
          value: "First task",
          tags: [ { tag: "done", value: undefined } ],
          children: [
            { type: "note", value: "A note about the task", ... }
          ]
        },
        { type: "task", value: "Second task", tags: [ ... ] }
      ]
    },
    ...
  ]
}
```

---

## Special Parsing Behavior

* The first line of a multi-line string becomes a `document` node if no other root structure is identified.
* Notes are *always* considered children of the line above, regardless of indentation.
* If a line has shallower or equal indentation to the current node, it is assumed to be a sibling or parent.

---

## Limitations

* The parser assumes clean input. It does not currently support:

  * Inline comments
  * Escaped colons or tags
  * Malformed tag syntax (e.g., `@due)`)