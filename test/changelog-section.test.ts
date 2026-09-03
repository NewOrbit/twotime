import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { extractChangelogSection } from "../scripts/changelog-section.ts";

const changelog = `# Changelog

## 3.4.0

- Added a thing.

### Details

- Sub-detail.

## 3.3.0

- Fixed a thing.
- Removed another thing.

## 3.2.0

- First entry.
`;

describe("extractChangelogSection", () => {
    const cases: [name: string, changelog: string, version: string, expected: string | undefined][] = [
        [
            "returns the body of the matching section without its heading",
            changelog,
            "3.3.0",
            "- Fixed a thing.\n- Removed another thing.",
        ],
        [
            "keeps sub-headings inside the section and stops at the next version heading",
            changelog,
            "3.4.0",
            "- Added a thing.\n\n### Details\n\n- Sub-detail.",
        ],
        ["returns the last section when nothing follows it", changelog, "3.2.0", "- First entry."],
        ["returns undefined when the version has no section", changelog, "3.1.0", undefined],
        [
            "matches the heading exactly, not as a prefix or suffix",
            "## 13.3.0\n\n- wrong\n\n## 3.3.0-beta.1\n\n- also wrong\n",
            "3.3.0",
            undefined,
        ],
        ["returns undefined for a section with no content", "## 3.3.0\n\n\n## 3.2.0\n\n- old\n", "3.3.0", undefined],
        ["tolerates Windows line endings", "## 3.3.0\r\n\r\n- Fixed a thing.\r\n\r\n## 3.2.0\r\n", "3.3.0", "- Fixed a thing."],
    ];

    for (const [name, input, version, expected] of cases) {
        it(name, () => {
            const result = extractChangelogSection(input, version);

            assert.strictEqual(result, expected);
        });
    }
});
