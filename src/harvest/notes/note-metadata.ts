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
    userStory: any;
    entity: any;
    finished: any;
}
