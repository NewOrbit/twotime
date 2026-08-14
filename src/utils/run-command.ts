import { log } from "./log.ts";

// Ctrl+C at a prompt makes @inquirer/prompts reject instead of killing the process, so that
// the application can decide what to do. If nothing catches it, the user gets a stack trace.
const isPromptCancellation = (error: unknown) => error instanceof Error && error.name === "ExitPromptError";

/**
 * Run a command, treating an interrupted prompt as a cancellation rather than a failure.
 * @param {Function} command the command to run
 */
export const runCommand = async (command: () => Promise<unknown>) => {
    try {
        await command();
    } catch (error) {
        if (!isPromptCancellation(error)) {
            throw error;
        }

        log.info("Cancelled");
    }
};
