export const splitIdAndName = (line: string) => {
    const parts = line.split(" ");

    return {
        id: parseInt(parts[0]),
        name: parts.slice(1).join(" ")
    };
};
