import { TargetProcessItem } from "../../src/harvest/notes/note-metadata";

export class TargetprocessItemBuilder {
    private id: number = 123;
    private name: string = "Foo";

    public withId(id: number) {
        this.id = id;
        return this;
    }

    public withName(name: string) {
        this.name = name;
        return this;
    }

    public build(): TargetProcessItem {
        return {
            id: this.id,
            name: this.name
        };
    }
}
