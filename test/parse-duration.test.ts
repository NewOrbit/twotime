import { TestFixture, TestCase, Expect } from "alsatian";
import { parseDuration } from "../src/utils/parse-duration";

@TestFixture()
export class ParseDurationTests {

    @TestCase(":10", 0, 10)
    @TestCase("1:06", 1, 6)
    @TestCase("4:22", 4, 22)
    @TestCase("17:08", 17, 8)
    public shouldParseDurationCorrectly(input: string, expectedHours: number, expectedMinutes: number) {
        const expected = {
            hours: expectedHours,
            minutes: expectedMinutes
        };

        const result = parseDuration(input);

        Expect(result).toEqual(expected);
    }

    @TestCase("01:")
    @TestCase("14")
    @TestCase("xx")
    public shouldReturnNullForBadInput(input: string) {
        const result = parseDuration(input);

        Expect(result).toEqual(null);
    }

}
