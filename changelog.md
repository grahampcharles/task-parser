## 1.2.6
All bugs seem related to the presence of whitespace lines; just stripping them out now.

## 1.2.5
Bugfixes for complex files.

## 1.2.3
Performance improvement on long files.

## 1.2.2
Added parents() method.

## 1.2.1

Added a blank line at the end of projects (as an option, but the default).

## 1.2.0

Currently, the "toString multiple projects" is failing because the parser ignores whitespace lines. I'm not sure how I want this dealt with. Preserving `unknown` lines would only be important if I want to be able to recreate taskpaper documents verbatim from the node tree.

* If I *do* want to recreate the document, then the `unknowns` should be tracked. 
* And if that's the case, why not just consider them `note` nodes of whatever precedes them? There's no syntactic difference between a non-task non-project node with some text and one that's just whitespace.

Anyway, leaving this for now