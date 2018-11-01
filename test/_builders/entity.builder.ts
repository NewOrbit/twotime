import { Entity, EntityType } from "../../src/harvest/notes/note-metadata";

export class EntityBuilder {
    private type: EntityType = EntityType.BUG;
    private id: number = 123;
    private name: string = "Foo";

    public withType(type: EntityType) {
        this.type = type;
        return this;
    }

    public withId(id: number) {
        this.id = id;
        return this;
    }

    public withName(name: string) {
        this.name = name;
        return this;
    }

    public build(): Entity {
        return {
            type: this.type,
            id: this.id,
            name: this.name
        };
    }
}
