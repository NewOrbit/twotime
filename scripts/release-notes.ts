// Prints the CHANGELOG.md section for one version to stdout, for the
// draft-release workflow. Exits 1 with a message on stderr when the section is
// missing, so the workflow can fall back to GitHub's generated notes.
//
//     node scripts/release-notes.ts 3.3.0
import { readFileSync } from "node:fs";

import { extractChangelogSection } from "./changelog-section.ts";

const changelogPath = "CHANGELOG.md";
const version = process.argv[2];

if (version === undefined) {
    process.stderr.write("usage: node scripts/release-notes.ts <version>\n");
    process.exit(2);
}

const section = extractChangelogSection(readFileSync(changelogPath, "utf8"), version);

if (section === undefined) {
    process.stderr.write(`${changelogPath} has no "## ${version}" section\n`);
    process.exit(1);
}

process.stdout.write(`${section}\n`);
