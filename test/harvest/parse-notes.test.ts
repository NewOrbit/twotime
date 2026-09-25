import { describe, it } from "node:test";
import assert from "node:assert/strict";

import type { ParsedNotes } from "../../src/harvest/helpers/parse-notes.ts";
import { parseNotes } from "../../src/harvest/helpers/parse-notes.ts";
import { EntityType } from "../../src/target-process/models/tp-bookable-entity.ts";

const USER_STORY_NAME = "4.1	System Automatically Deletes all Previously Archived – Single Use Process";
const USER_STORY_LINE = `*User story:* #35858 ${USER_STORY_NAME}`;

describe("parseNotes", () => {
    it("parses a finished bug correctly", () => {
        const input = [
            USER_STORY_LINE,
            "*Bug:* #40732 v8.13 - FK AdditionalApplicationAnswers",
            "*Status:* finished",
            "*Recorded by:* twotime 0.0.0",
        ].join("\n");

        const expected: ParsedNotes = {
            metadata: {
                tpBookableEntity: {
                    ResourceType: EntityType.BUG,
                    Id: 40732,
                    Name: "v8.13 - FK AdditionalApplicationAnswers",
                    UserStory: {
                        Id: 35858,
                        Name: USER_STORY_NAME,
                        ResourceType: "UserStory",
                    },
                },
                finished: true,
                version: "0.0.0",
            },
            additionalNotes: [],
        };

        const res = parseNotes(input);

        assert.deepStrictEqual(res, expected);
    });

    it("parses an unfinished bug correctly", () => {
        const input = [
            USER_STORY_LINE,
            "*Bug:* #40732 v8.13 - FK AdditionalApplicationAnswers",
            "*Recorded by:* twotime 0.0.0",
        ].join("\n");

        const expected: ParsedNotes = {
            metadata: {
                tpBookableEntity: {
                    ResourceType: EntityType.BUG,
                    Id: 40732,
                    Name: "v8.13 - FK AdditionalApplicationAnswers",
                    UserStory: {
                        Id: 35858,
                        Name: USER_STORY_NAME,
                        ResourceType: "UserStory",
                    },
                },
                finished: false,
                version: "0.0.0",
            },
            additionalNotes: [],
        };

        const res = parseNotes(input);

        assert.deepStrictEqual(res, expected);
    });

    it("parses an unfinished bug correctly when the finished note is malformed", () => {
        const input = [
            USER_STORY_LINE,
            "*Bug:* #40732 v8.13 - FK AdditionalApplicationAnswers",
            "*Status:* finished but it's not the correct format!",
            "*Recorded by:* twotime 0.0.0",
        ].join("\n");

        const expected: ParsedNotes = {
            metadata: {
                tpBookableEntity: {
                    ResourceType: EntityType.BUG,
                    Id: 40732,
                    Name: "v8.13 - FK AdditionalApplicationAnswers",
                    UserStory: {
                        Id: 35858,
                        Name: USER_STORY_NAME,
                        ResourceType: "UserStory",
                    },
                },
                finished: false,
                version: "0.0.0",
            },
            additionalNotes: [],
        };

        const res = parseNotes(input);

        assert.deepStrictEqual(res, expected);
    });

    it("parses a finished task correctly", () => {
        const input = [USER_STORY_LINE, "*Task:* #12345 Foo! Bar", "*Status:* finished", "*Recorded by:* twotime 0.0.0"].join("\n");

        const expected: ParsedNotes = {
            metadata: {
                tpBookableEntity: {
                    ResourceType: EntityType.TASK,
                    Id: 12345,
                    Name: "Foo! Bar",
                    UserStory: {
                        Id: 35858,
                        Name: USER_STORY_NAME,
                        ResourceType: "UserStory",
                    },
                },
                finished: true,
                version: "0.0.0",
            },
            additionalNotes: [],
        };

        const res = parseNotes(input);

        assert.deepStrictEqual(res, expected);
    });

    it("parses correctly for an unescaped symbol", () => {
        const input = [
            USER_STORY_LINE,
            "*Task:* #12345 Foo! Bar",
            "*Status:* finished",
            "*Recorded by:* twotime 0.0.0",
            "some additional notes",
            "and some more",
        ].join("\n");

        const expected: ParsedNotes = {
            metadata: {
                tpBookableEntity: {
                    ResourceType: EntityType.TASK,
                    Id: 12345,
                    Name: "Foo! Bar",
                    UserStory: {
                        Id: 35858,
                        Name: USER_STORY_NAME,
                        ResourceType: "UserStory",
                    },
                },
                finished: true,
                version: "0.0.0",
            },
            additionalNotes: ["some additional notes", "and some more"],
        };

        const res = parseNotes(input);

        assert.deepStrictEqual(res, expected);
    });

    it("parses an unfinished task correctly when the finished note is malformed", () => {
        const input = [
            USER_STORY_LINE,
            "*Task:* #12345 Foo! Bar",
            "*Status:* finished but it's not the correct format!",
            "*Recorded by:* twotime 0.0.0",
        ].join("\n");

        const expected = {
            metadata: {
                tpBookableEntity: {
                    ResourceType: EntityType.TASK,
                    Id: 12345,
                    Name: "Foo! Bar",
                    UserStory: {
                        Id: 35858,
                        Name: USER_STORY_NAME,
                        ResourceType: "UserStory",
                    },
                },
                finished: false,
                version: "0.0.0",
            },
            additionalNotes: [],
        };

        const res = parseNotes(input);

        assert.deepStrictEqual(res, expected);
    });

    for (const additionalNotes of ["Some extra notes", "bla bla bla", "it's true!"]) {
        it(`parses the additional note "${additionalNotes}" correctly`, () => {
            const input = [
                "*User story:* #12345 Foo",
                "*Task:* #67890 Bar",
                "*Status:* finished",
                "*Recorded by:* twotime 0.0.0",
                additionalNotes,
            ].join("\n");

            const res = parseNotes(input);

            assert.deepStrictEqual(res.additionalNotes, [additionalNotes]);
        });
    }

    it("parses additional notes when they are split", () => {
        const input = [
            "*User story:* #12345 Foo",
            "*Task:* #67890 Bar",
            "this is the first initial part",
            "*Status:* finished",
            "*Recorded by:* twotime 0.0.0",
            "second initial parts",
        ].join("\n");

        const res = parseNotes(input);

        assert.deepStrictEqual(res.additionalNotes, ["this is the first initial part", "second initial parts"]);
    });

    for (const version of ["0.0.0", "1.2.3", "7.16.1"]) {
        it(`parses the version ${version} correctly`, () => {
            const input = [
                "*User story:* #12345 Foo",
                "*Task:* #67890 Bar",
                "*Status:* finished",
                `*Recorded by:* twotime ${version}`,
            ].join("\n");

            const res = parseNotes(input);

            assert.deepStrictEqual(res.metadata?.version, version);
        });
    }
});
