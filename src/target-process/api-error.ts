/**
 * Error thrown by the Targetprocess API wrapper for non-2xx responses.
 * Keeps the { statusCode, message } shape that callers match on.
 */
export class TargetprocessApiError extends Error {
    public statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
    }
}
