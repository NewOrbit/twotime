import { prefixes } from "./prefixes";

export const getPrefix = (entity: { ResourceType: string }) => {
    if (entity.ResourceType === "UserStory") {
        return prefixes.userStory;
    }

    if (entity.ResourceType === "Bug") {
        return prefixes.bug;
    }

    if (entity.ResourceType === "Task") {
        return prefixes.task;
    }

    return `[UNRECOGNISED RESOURCE TYPE ${entity.ResourceType}]`;
};
