export function splitLines(input: string): string[] {
    return normalizeLineFeeds(input).split("\n");
}

export function firstLine(input: string): string {
    return normalizeLineFeeds(input).split("\n", 1)[0];
}

function normalizeLineFeeds(input: string): string {
    return input.replace(/\r\n/gm, "\n").replace(/\r/gm, "\n");
}

