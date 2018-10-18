/*
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = () => (new Date()).toISOString().slice(0,10);
