export const startArrayAt = <T>(arr: T[], target: number) => {
    return [ ...arr.slice(target, arr.length), ...arr.slice(0, target) ];
};
