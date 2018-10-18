export const getProjectedTimeRemaining = (remaining: number, logged: number) => {
    if (logged >= remaining) {
        return 0;
    }

    return remaining - logged;
};
