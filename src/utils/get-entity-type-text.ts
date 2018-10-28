import { EntityType } from "../harvest/notes/note-metadata";

export const getEntityTypeText = (type: EntityType) => type === EntityType.BUG ? "bug" : "task";
