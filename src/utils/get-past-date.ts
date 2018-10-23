import * as moment from "moment";

export const getPastDate = (offset: number) => moment().add(-offset, "days").format("YYYY-MM-DD");
