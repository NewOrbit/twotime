const parsePrefix = (line: string, prefix: string) => {
    if (line.indexOf(prefix) !== 0) {
        return null;
    }

    const withoutPrefix = line.substring(prefix.length);

    return withoutPrefix;
};

/*
 * Given a list of lines, and a prefix, find the line beginning with that prefix (minus the prefix itself).
 *
 * e.g. given ([ "> foo bla" ], "> foo"), it will return "bla"
 */
const findPrefixInLines = (lines: string[], prefix: string) => {
    const matching = lines
        .map(l => parsePrefix(l, prefix))
        .filter(x => x !== null);

    if (matching.length === 0) {
        return null;
    }

    return matching[0];
};

export { findPrefixInLines };
