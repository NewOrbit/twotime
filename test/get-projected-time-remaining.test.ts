import { TestFixture, TestCase, Expect } from "alsatian";
import { getProjectedTimeRemaining } from "../src/utils/get-projected-time-remaining";

@TestFixture()
export class GetProjectedTimeRemainingTests {

    @TestCase(2.5, 1, 1.5)
    @TestCase(3, 2, 1)
    @TestCase(7.22, 0.22, 7)
    @TestCase(1.48, 0, 1.48)
    @TestCase(1, 2, 0)
    @TestCase(3, 15.55, 0)
    public shouldCalculateCorrectly(remaining: number, logged: number, expected: number) {
        const result = getProjectedTimeRemaining(remaining, logged);

        Expect(result).toBe(expected);
    }

}
