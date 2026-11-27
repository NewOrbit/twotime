// Returns the body of the `## <version>` section of a Keep-a-Changelog style
// document, without the heading and with surrounding blank lines trimmed.
// The heading has to match exactly: `## 3.3.0` is found for "3.3.0", while
// `## 13.3.0` and `## 3.3.0-beta.1` are not. A section runs until the next
// `## ` heading, so `###` sub-headings stay inside it. Returns undefined when
// there is no such section or it has no content.
export function extractChangelogSection(changelog: string, version: string): string | undefined {
    const lines = changelog.split(/\r?\n/);
    const heading = `## ${version}`;
    const start = lines.findIndex((line) => line.trimEnd() === heading);

    if (start === -1) {
        return undefined;
    }

    const rest = lines.slice(start + 1);
    const nextHeading = rest.findIndex((line) => line.startsWith("## "));
    const body = (nextHeading === -1 ? rest : rest.slice(0, nextHeading)).join("\n").trim();

    return body === "" ? undefined : body;
}
