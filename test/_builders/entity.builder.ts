import { TpBookableEntity, EntityType } from "../../src/target-process/models/tp-bookable-entity";
import { TpUserStory } from "../../src/target-process/models/tp-user-story";

export class EntityBuilder {
    private type: EntityType = EntityType.BUG;
    private id: number = 123;
    private name: string = "Foo";
    private userStory?: TpUserStory;

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

    public withUserStory(userStory: TpUserStory) {
        this.userStory = userStory;
        return this;
    }

    public build(): TpBookableEntity {
        return {
            Id: this.id,
            Name: this.name,
            ResourceType: this.type,
            UserStory: this.userStory
        };
    }
}
