import * as moment from "moment";

export const isValidDate = (date: string) => moment(date, "YYYY-MM-DD", true).isValid();
