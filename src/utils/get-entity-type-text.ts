import { EntityType } from "../harvest/notes/note-information";

export const getEntityTypeText = (type: EntityType) => type === EntityType.BUG ? "bug" : "task";
