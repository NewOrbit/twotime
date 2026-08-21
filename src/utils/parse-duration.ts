const TIME_REGEX = /(\d?\d?):([0-6][0-9])/;

export const parseDuration = (input: string) => {
    const parsed = TIME_REGEX.exec(input);

    if (parsed === null) {
        return null;
    }

    // both groups always participate in a successful match; defaults are here only
    // to satisfy noUncheckedIndexedAccess without changing behaviour
    const [, hoursPart = "", minutesPart = ""] = parsed;

    // hours are optional so default to 0
    const parsedHours = parseInt(hoursPart, 10) || 0;

    return {
        hours: parsedHours,
        minutes: parseInt(minutesPart, 10),
    };
};
