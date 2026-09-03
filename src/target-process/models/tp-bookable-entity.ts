/**
 * Targetprocess bookable entity (task or bug) common model for consumption within this utility.
 * Ian French, NewOrbit Ltd, Jan 2025.
 */

import type { TpUserStory } from "./tp-user-story.ts";
import type { TpProject } from "./tp-project.ts";
import type { TpEntityState } from "./tp-entity-state.ts";

/**
 * Enumeration of the possible entity types, extracted from the "ResourceType" property of the TP entity.
 * Declared as a const object rather than an `enum` so the syntax is fully erasable, letting Node run
 * these sources directly via native type stripping. Call sites are unchanged.
 */
export const EntityType = {
    BUG: "Bug",
    TASK: "Task",
    USERSTORY: "UserStory",
} as const;

export type EntityType = (typeof EntityType)[keyof typeof EntityType];

/**
 * Targetprocess bookable entity (task or bug) common model. Straight from TP, properties start with
 * capital letters. This model represents only a subset of the available properties.
 */
export interface TpBookableEntity {
    Id: number;
    Name: string; // this will be the bookable item (task or issue) name
    ResourceType?: EntityType;
    TimeRemain?: number;
    TimeSpent?: number;
    Units?: string;
    UserStory?: TpUserStory;
    Project?: TpProject;
    EntityState?: TpEntityState;
}
