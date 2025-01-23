import { TestFixture, TestCase, Expect } from "alsatian";
import { isValidDate } from "../src/utils/dates";

const MOCK_TODAY_DATE_RESULT = "1996-01-01";
const MOCK_GET_TODAY_DATE = () => MOCK_TODAY_DATE_RESULT;

@TestFixture()
export class IsValidDateTests {

    @TestCase("2018-01-01")
    @TestCase("2015-12-08")
    public shouldReturnTrueWhenValidDateProvided(providedDate: string) {
        const result = isValidDate(providedDate);

        Expect(result).toBe(true);
    }

    @TestCase(undefined)
    @TestCase(null)
    @TestCase("2018-01")
    @TestCase("07-01-2017")
    @TestCase("2018/04/04")
    @TestCase("2018-01-40")
    public shouldReturnFalseWhenInvalidDateProvided(providedDate: string) {
        const result = isValidDate(providedDate);

        Expect(result).toBe(false);
    }

}
