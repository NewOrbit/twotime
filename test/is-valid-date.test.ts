import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isValidDate } from "../src/utils/dates.ts";

describe("isValidDate", () => {

    for (const providedDate of ["2018-01-01", "2015-12-08"]) {
        it(`returns true for the valid date "${providedDate}"`, () => {
            const result = isValidDate(providedDate);

            assert.strictEqual(result, true);
        });
    }

    // undefined and null are deliberately included: these assert that the function is
    // robust against non-string input, which its signature does not admit. The casts
    // keep that intent explicit rather than widening the signature to suit the tests.
    const invalidDates: (string | undefined | null)[] = [
        undefined,
        null,
        "2018-01",
        "07-01-2017",
        "2018/04/04",
        "2018-01-40"
    ];

    for (const providedDate of invalidDates) {
        it(`returns false for the invalid date ${JSON.stringify(providedDate) ?? "undefined"}`, () => {
            const result = isValidDate(providedDate as string);

            assert.strictEqual(result, false);
        });
    }

});
