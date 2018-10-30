const TIME_REGEX = /(\d?\d?):([0-6][0-9])/;

export const parseDuration = (input: string) => {
    const parsed = TIME_REGEX.exec(input);

    if (parsed === null) {
        return null;
    }

    // hours are optional so default to 0
    const parsedHours = parseInt(parsed[1], 10) || 0;

    return {
        hours: parsedHours,
        minutes: parseInt(parsed[2], 10)
    };
};
