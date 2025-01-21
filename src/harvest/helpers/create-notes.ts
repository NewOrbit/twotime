/**
 * A set of functions for creating the notes field for Harvest time entries.
 * Ian French, NewOrbit Ltd, Jan 2025 - adapted from the old code base.
 */

import { EntityType, TpBookableEntity } from "../../target-process/models/tp-bookable-entity";
import { NoteMetadata } from "../models/time-entry";
import { NotePrefixes } from "../models/note-prefixes";

/**
 * Given a Targetprocess bookable item and a twotime version string, create the metadata for the notes field.
 * @param tpItem the Targetprocess bookable item.
 * @param version the twotime version string.
 * @returns {NoteMetadata | null} the metadata object for the notes field, or null if there's no TP entity.
 */
export const createNoteMetadata = (tpItem: TpBookableEntity, version: string) => {
  if (tpItem) {
    const notesMetadata: NoteMetadata = {
      tpItem,
      finished: false,
      version
    };
    return notesMetadata;
  }

  return null;
};

/**
 * Given the already-constructed notes metadata and an optional array of additional notes, create the notes field.
 * @param metadata the notes metadata object.
 * @param additionalNotes the optional array of additional notes.
 * @returns {string} the constructed notes field as a single string, suitable for the Harvest API.
 */
export const createNotes = (metadata: NoteMetadata | null, additionalNotes?: string[]): string => {
  const notesLines: string[] = [];

  const tpItem = metadata?.tpItem;
  if (tpItem) {
    // There is a TP item in play i.e. it's not a NewOrbit internal item
    if (tpItem.UserStory) {
      const line = createNotesLine(NotePrefixes.userStory, tpItem.UserStory.Id, tpItem.UserStory.Name);
      notesLines.push(line);
    }

    const prefix = tpItem.ResourceType === EntityType.TASK ? NotePrefixes.task : NotePrefixes.bug;
    const line = createNotesLine(prefix, tpItem.Id, tpItem.Name);
    notesLines.push(line);
  }

  if (metadata?.finished) {
    notesLines.push(sanitisePrefix(NotePrefixes.finished));
  }

  if (metadata) {
    notesLines.push(`${sanitisePrefix(NotePrefixes.twotime)}${metadata.version}`);
  }

  if (additionalNotes) {
    additionalNotes.forEach(line => notesLines.push(line));
  }

  return notesLines.join("\n");
};

// Internal function to create a single line of notes, given a prefix, numerical ID and name.
const createNotesLine = (prefix: string, id: number, name: string) => {
  return `${sanitisePrefix(prefix)}${id} ${name}`;
};

// Internal function to sanitise the prefix for HTML display - will be going away soon.
const sanitisePrefix = (prefix: string) => prefix.replace(/\>/g, "&gt;");
