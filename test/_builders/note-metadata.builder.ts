import { NoteMetadata, TargetProcessItem, EntityType, Entity } from "../../src/harvest/notes/note-metadata";
import { TargetprocessItemBuilder } from "./targetprocess-item.builder";
import { EntityBuilder } from "./entity.builder";

export class NoteMetadataBuilder {
    private userStory: TargetProcessItem = new TargetprocessItemBuilder().build();
    private entity: Entity = new EntityBuilder().build();
    private finished: boolean = false;
    private version: string = "0.0.0";

    public withUserStory(userStory: TargetProcessItem) {
        this.userStory = userStory;
        return this;
    }

    public withEntity(entity: Entity) {
        this.entity = entity;
        return this;
    }

    public withFinished(finished: boolean) {
        this.finished = finished;
        return this;
    }

    public withVersion(version: string) {
        this.version = version;
        return this;
    }

    public build(): NoteMetadata {
        return {
            userStory: this.userStory,
            entity: this.entity,
            finished: this.finished,
            version: this.version
        };
    }
}
