export enum EntityType {
    BUG,
    TASK
}

export interface Entity extends TargetProcessItem {
    type: EntityType;
}

export interface TargetProcessItem {
    id: number;
    name: string;
}

export interface NoteInformation {
    userStory: TargetProcessItem;
    entity: Entity;
    finished: boolean;
    additionalNotes: string[];
}
