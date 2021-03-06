import { NoteMetadata, EntityType } from "./note-metadata";

// create a NoteInformation from a TP entity

const getEntityTypeFromResourceType = (resourceType: "Bug" | "Task") => resourceType === "Bug" ? EntityType.BUG : EntityType.TASK;

const getEntityInformationFromTpEntity = (tpEntity: {
    ResourceType: "Bug" | "Task",
    Id: number,
    Name: string
}) => {
    if (tpEntity === null || tpEntity === undefined) {
        return null;
    }

    return {
        type: getEntityTypeFromResourceType(tpEntity.ResourceType),
        id: tpEntity.Id,
        name: tpEntity.Name
    };
};

const getUserStoryInformationFromTpEntity = (tpEntity: {
    UserStory: {
        Id: number,
        Name: string
    }
}) => {
    if (tpEntity === null || tpEntity === undefined || !tpEntity.UserStory) {
        return null;
    }

    return {
        id: tpEntity.UserStory.Id,
        name: tpEntity.UserStory.Name
    };
};

export const createNoteMetadata = (tpEntity: any, version: string) => {
    if (!tpEntity) {
        return null;
    }

    const entity = getEntityInformationFromTpEntity(tpEntity);
    const userStory = getUserStoryInformationFromTpEntity(tpEntity);

    return {
        userStory,
        entity,
        finished: false,
        version
    } as NoteMetadata;
};
