import type { TpBookableEntity } from "../../src/target-process/models/tp-bookable-entity.ts";
import type { NoteMetadata } from "../../src/harvest/models/time-entry.ts";

import { EntityBuilder } from "./entity.builder.ts";

export class NoteMetadataBuilder {
    private entity: TpBookableEntity = new EntityBuilder().build();
    private finished: boolean = false;
    private version: string = "0.0.0";

    public withEntity(entity: TpBookableEntity) {
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
            tpBookableEntity: this.entity,
            finished: this.finished,
            version: this.version
        };
    }
}
