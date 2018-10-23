import { TestFixture, TestCase, Expect } from "alsatian";
import { parseDateOption } from "../src/utils/parse-date-option";

const MOCK_TODAY_DATE_RESULT = "1996-01-01";
const MOCK_GET_TODAY_DATE = () => MOCK_TODAY_DATE_RESULT;

@TestFixture()
export class ParseDateOptionTests {

    @TestCase("2018-01-01")
    @TestCase("2015-12-08")
    public shouldReturnDateWhenValidDateProvided(providedDate: string) {
        const result = parseDateOption(MOCK_GET_TODAY_DATE, providedDate);

        Expect(result).toBe(providedDate);
    }

    @TestCase(undefined)
    @TestCase(null)
    public shouldReturnTodayDateWhenNoProvided(providedDate: string) {
        const result = parseDateOption(MOCK_GET_TODAY_DATE, providedDate);

        Expect(result).toBe(MOCK_TODAY_DATE_RESULT);
    }

    @TestCase("2018-01")
    @TestCase("07-01-2017")
    @TestCase("2018/04/04")
    @TestCase("2018-01-40")
    public shouldReturnTodayDateWhenInvalidDateProvided(providedDate: string) {
        const result = parseDateOption(MOCK_GET_TODAY_DATE, providedDate);

        Expect(result).toBe(MOCK_TODAY_DATE_RESULT);
    }

}
