export const todoSimple = `Test Project 1:
\t- test item 1
\t- test item 2 @tag1
\t- test item 3 @tag1 @tag2(value)
\tTest SubProject 1:
\t\t- test subitem 1 @tag1

Test Project 2:
\t- test item 4`;

export const testDocumentWithMultipleSubprojects = `Today:
\tSubProject 1:
\t\t- task 
\t\t- task

\tSubproject 2:
\t\t- task @done`;


export const todoSpaceBetweenProjects = `Test Project 1:
\tTask 1

Test Project 2:
\tTask 2`;

export const todoNoSpaceBetweenProjects = `Test Project 1:
\tTask 1
Test Project 2:
\tTask 2`;


export const taskSimple = `- test item 2 @annual(11/1) @due(2022-11-01)`;

export const todoSingleProject = `Test Project 1:
\t- test item 1
\t- test item 2 @tag1
\t- test item 3 @tag1 @tag2(value)
`;

export const todoWithNotes = `Test Project 1:
\t- test item 1
\tNormally indented note, single line.
\t- test item 2
Non-indented note, single line.
\t- test item 3
\t\t\t\tSuper-indented note, single line.
\t- test item 4
\tNormally indented note,
\tmultiple lines.
\t- test item 5
Differently indented note, 
\t\t\tmultiple lines.
\t- test item 6
\tNote with a colon inside: this is a thing!`;
