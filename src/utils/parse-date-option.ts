import * as moment from "moment";

const isValidDate = (date: string) => moment(date, "YYYY-MM-DD", true).isValid();

export const parseDateOption = (getTodayDate: () => string, date: string) => {
    if (date === null || date === undefined || isValidDate(date) === false) {
        return getTodayDate();
    }

    return date;
};
