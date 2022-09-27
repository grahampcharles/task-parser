export function splitLines(input: string): string[] {
    return normalizeLineFeeds(input).split("\n");
}

export function firstLine(input: string): string {
    return normalizeLineFeeds(input).split("\n", 1)[0];
}

function normalizeLineFeeds(input: string): string {
    return input.replace(/\r\n/gm, "\n").replace(/\r/gm, "\n");
}

export function removeEmptyElements(input: string[]): string[] {
    return input.filter((line) => {
        return !isWhiteSpace(line); // returns true on any non-whitespace found
    });
}

export function isWhiteSpace(input: string): boolean {
    return !/\S/.test(input);
}

export function firstNonBlank(input: string []) : number {
    return input.findIndex((line) => !isWhiteSpace(line));
}
