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
 * @param {string} inputDate the input date, expected as a string in ISO format e.g. '2024-01-14'
 * @returns {boolean} true if the date is valid, false otherwise
 */
export const isValidDate = (inputDate: string) => {
  try {
    const testDate = new Date(inputDate);
    // It's a valid date, now check there was no shift e.g. 30 Feb -> 2 Mar
    return formatDate(testDate) === inputDate;
  } catch {
    return false;
  }
};

const formatDate = (rawDate: Date) => rawDate.toISOString().split("T")[0];
