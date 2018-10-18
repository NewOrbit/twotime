import { NoteInformation, EntityType } from "./note-information";

// create a NoteInformation from a TP entity

const getEntityTypeFromResourceType = (resourceType: "Bug" | "Task") => resourceType === "Bug" ? EntityType.BUG : EntityType.TASK;

const getEntityInformationFromTpEntity = (tpEntity: { 
    ResourceType: "Bug" | "Task", 
    Id: number, 
    Name: string 
}) => {
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
    if (!tpEntity.UserStory) {
        return null;
    }

    return {
        id: tpEntity.UserStory.Id,
        name: tpEntity.UserStory.Name
    };
};

export const createNoteInformation = (tpEntity: any) => {
    if (tpEntity === null || tpEntity === undefined) {
        return null;
    }

    const entity = getEntityInformationFromTpEntity(tpEntity);
    const userStory = getUserStoryInformationFromTpEntity(tpEntity);
    
    return {
        userStory: userStory,
        entity: entity,
        finished: false,
        additionalNotes: []
    } as NoteInformation;
};
