export const splitIdAndName = (line: string) => {
    const parts = line.split(" ");

    return {
        id: parseInt(parts[0], 10),
        name: parts.slice(1).join(" ")
    };
};
