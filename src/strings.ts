export function splitLines(input: string): string[] {
    return input.replace(/\r\n/gm, "\n").replace(/\r/gm, "\n").split("\n");
}
