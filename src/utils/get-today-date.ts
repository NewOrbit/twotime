import * as moment from "moment";

/*
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = () => moment().format("YYYY-MM-DD");
