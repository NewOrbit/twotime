/**
 * Utilities to handle dates, replacing the obsolete 'moment' library.
 * Ian French, NewOrbit Ltd, Jan 2025 - adapted from the old code base.
 */

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} today's date e.g. '2025-01-14'
 */
export const getTodaysDate = () => formatDate(new Date());

/**
 * Get a date in the past via 'offset' number of days
 * @param {number} offset the number of days in the past
 * @returns {string} the date in the past
 */
export const getDateInPast = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() - Math.round(offset));
  return formatDate(d);
};

/**
 * Check whether a date is valid.
 * Accepts null/undefined because the only caller passes an untyped commander option
 * (see getDateForCommand in register-commands.ts), which is absent when --date is omitted.
 * @param {string | undefined | null} inputDate the input date, expected as a string in ISO format e.g. '2024-01-14'
 * @returns {boolean} true if the date is valid, false otherwise
 */
export const isValidDate = (inputDate: string | undefined | null) => {
  // Guard explicitly rather than letting new Date(undefined) produce an Invalid Date
  // and relying on formatDate's toISOString to throw. Same outcome, stated plainly.
  if (typeof inputDate !== "string") {
    return false;
  }

  try {
    const testDate = new Date(inputDate);
    // It's a valid date, now check there was no shift e.g. 30 Feb -> 2 Mar
    return formatDate(testDate) === inputDate;
  } catch {
    return false;
  }
};

// slice rather than split("T")[0]: an ISO string is always YYYY-MM-DDTHH:mm:ss.sssZ,
// so this is equivalent but provably a string rather than string | undefined.
const formatDate = (rawDate: Date) => rawDate.toISOString().slice(0, 10);
