import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";

import { runCommand } from "../src/utils/run-command.ts";

// @inquirer/core rejects with an Error named "ExitPromptError" when a prompt is interrupted.
// It is not exported from @inquirer/prompts, so the same shape is recreated here.
const exitPromptError = () => {
    const error = new Error("User force closed the prompt with SIGINT");
    error.name = "ExitPromptError";

    return error;
};

const runCapturingLog = async (command: () => Promise<unknown>) => {
    const lines: string[] = [];
    const spy = mock.method(console, "log", (message: string) => {
        lines.push(message);
    });

    try {
        await runCommand(command);
    } finally {
        spy.mock.restore();
    }

    return lines.join("\n");
};

describe("runCommand", () => {
    it("runs the command and logs nothing when it succeeds", async () => {
        let ran = false;

        const output = await runCapturingLog(async () => {
            ran = true;
        });

        assert.strictEqual(ran, true);
        assert.strictEqual(output, "");
    });

    it("swallows an interrupted prompt and reports the cancellation", async () => {
        const output = await runCapturingLog(async () => {
            throw exitPromptError();
        });

        assert.match(output, /Cancelled/);
    });

    it("rethrows a genuine failure so it is not mistaken for a cancellation", async () => {
        await assert.rejects(
            () =>
                runCommand(async () => {
                    throw new Error("Harvest is down");
                }),
            /Harvest is down/
        );
    });

    // The name is the only thing separating a cancellation from a failure, so an ordinary
    // Error must not be swallowed just because its message mentions the prompt.
    it("rethrows an error that merely mentions the prompt", async () => {
        await assert.rejects(
            () =>
                runCommand(async () => {
                    throw new Error("ExitPromptError");
                }),
            /ExitPromptError/
        );
    });
});
