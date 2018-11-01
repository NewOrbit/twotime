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

export interface NoteMetadata {
    userStory: TargetProcessItem;
    entity: Entity;
    finished: boolean;
    version: string;
}
