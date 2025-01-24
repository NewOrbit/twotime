/**
 * Utilities to support the creation and editing of the notes field for Harvest time entries.
 * Ian French, NewOrbit Ltd, Jan 2025 - adapted from the old code base.
 */

/**
 * Split a string, delimited by carriage-return line-feed pairs, into an array of lines.
 * @param multiLineString the notes field of a Harvest time entry.
 * @returns {RegExpMatchArray | []} an array of matched lines.
 */
export const splitLines = (multiLineString: string) => multiLineString.match(/[^\r\n]+/g) || [];

/**
 * Strip out the given prefix from the incoming line [note: method badly named and will be changed].
 * @param line the incoming line with the expected prefix.
 * @param prefix the prefix to remove.
 * @returns {string | null} the line without the prefix, or null if the prefix is not found.
 */
export const parsePrefix = (line: string, prefix: string) => {
  let withoutPrefix = null;
  if (line.indexOf(prefix) === 0) {
    withoutPrefix = line.substring(prefix.length);
  }
  return withoutPrefix;
};

/**
 * Given a list of lines and a prefix, find the line beginning with that prefix (minus the prefix itself).
 * For example, given ([ "> alpha bravo", "> foo bar" ], "> foo"), it will return "bar".
 * Note that the empty string is a valid outcome, so this function returns null if no matches were found.
 * @param lines the incoming list of lines.
 * @param prefix the prefix to search for.
 * @returns {string} the found line minus prefix or null if not found.
 */
export const findPrefixInLines = (lines: string[], prefix: string) => {
  const matching = lines.map(line => parsePrefix(line, prefix)).filter(mappedLine => mappedLine !== null);
  return matching.length > 0 ? matching[0] : null;
};

/**
 * Return a list of lines that do not contain any of the given prefixes.
 * @param lines the incoming list of lines.
 * @param prefixes the list of prefixes to search for.
 * @returns {string[]} a list of lines that do not contain any of the given prefixes.
 */
export const findLinesWithoutPrefix = (lines: string[], prefixes: string[]) => {
  return lines.filter(line => noPrefixesInLine(line, prefixes));
};

// Internal function to check whether a single line contains any of the given prefixes.
const noPrefixesInLine = (line: string, prefixes: string[]) => prefixes.every(p => parsePrefix(line, p) === null);
