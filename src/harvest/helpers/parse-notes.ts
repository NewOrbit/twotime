/**
 * A set of functions for parsing the notes field for Harvest time entries.
 * Ian French, NewOrbit Ltd, Jan 2025 - adapted from the old code base.
 */

import { NoteMetadata } from "../models/time-entry";
import { NotePrefixes } from "../models/note-prefixes";

import { EntityType } from "../../target-process/models/tp-bookable-entity";
import { constructTpEntity } from "../../target-process/helpers/tp-utilities";

import { findLinesWithoutPrefix, findPrefixInLines, splitLines } from "./notes-utilities";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const entities = require("entities");  // this is going away but keep for now

// --- Declare internal interfaces ---

interface ParsedLine {
  id: number;
  name: string;
}

// --- Exported interfaces

export interface ParsedNotes {
  metadata: NoteMetadata | null;
  additionalNotes: string[];
}

// --- Exported functions ---

/**
 * Given an single string holding a complete Harvest notes entry, parse it into its constituent
 * parts for further processing.
 * @param {string} notes the notes field of a Harvest time entry.
 * @returns {ParsedNotes} the parsed notes object.
 */
export const parseNotes = (notes: string) => {
  const lines = splitLines(entities.decodeHTML(notes));
  const metadata = getMetadata(lines);
  const additionalNotes = getAdditionalNotes(lines);

  const parsedNotes: ParsedNotes = {
    metadata,
    additionalNotes
  };

  return parsedNotes;
};

// --- Internal functions ---

/**
 * Get the various bits of information (metadata) from the notes lines.
 * @param {string[]} lines the incoming list of lines holding all the notes
 * @returns {NoteMetadata | null} the notes metadata object, or null if no metadata found.
 */
const getMetadata = (lines: string[]) => {
  // Extract the user story information from the notes lines
  const userStoryLine = findPrefixInLines(lines, NotePrefixes.userStory);
  const userStoryParts = userStoryLine !== null ? splitIdAndName(userStoryLine) : null;

  // Extract the TP entity information from the notes lines, trying for task first, then bug
  let entityLine = findPrefixInLines(lines, NotePrefixes.task);
  let entityType = EntityType.TASK;
  // Check if entityLine is falsy rather than explicitly null, as there won't be valid info in an empty string.
  if (!entityLine) {
    entityLine = findPrefixInLines(lines, NotePrefixes.bug);
    entityType = EntityType.BUG;
  }
  const entityParts = entityLine ? splitIdAndName(entityLine) : null;

  // Extract the TP entity status
  const finished = findPrefixInLines(lines, NotePrefixes.finished) === "";

  // Return null if there is no TP entity and there is no 'finished' indication in the notes
  if (entityParts === null && !finished) {
    return null;
  }

  const version = findPrefixInLines(lines, NotePrefixes.twotime) || "Twotime unknown version";
  const tpBookableEntity = entityParts
    ? constructTpEntity(userStoryParts?.id || 0, userStoryParts?.name || "", entityParts.id, entityParts.name, entityType)
    : null;

  const notesMetadata: NoteMetadata = {
    tpBookableEntity,
    finished,
    version
  };

  return notesMetadata;
};

// Get any additional notes that are not part of the metadata
const getAdditionalNotes = (lines: string[]) => {
  return findLinesWithoutPrefix(
    lines,
    [
      NotePrefixes.task,
      NotePrefixes.bug,
      NotePrefixes.userStory,
      NotePrefixes.finished,
      NotePrefixes.twotime
    ]);
};

// Split a line representing a task/bug or user story into its numerical ID and name parts
const splitIdAndName = (line: string) => {
  const parts = line.split(" ");
  const result: ParsedLine = {
    id: parseInt(parts[0], 10),  // decimal
    name: parts.slice(1).join(" ")  // rejoin the rest of the parts after the initial ID
  };

  return result;
};
