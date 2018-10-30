import { TestFixture, TestCase, Expect } from "alsatian";
import { startArrayAt } from "../src/utils/start-array-at";

@TestFixture()
export class StartArrayAtTests {

    @TestCase([0, 1, 2, 3], 2, [2, 3, 0, 1])
    @TestCase([0, 1, 2, 3], 1, [1, 2, 3, 0])
    @TestCase(["foo", "bar", "baz"], 1, ["bar", "baz", "foo"])
    @TestCase([true, false, false, true], 1, [false, false, true, true])
    public shouldOrderArrayCorrectly(input: any[], target: number, expected: any[]) {
        const result = startArrayAt(input, target);

        Expect(result).toEqual(expected);
    }

}
