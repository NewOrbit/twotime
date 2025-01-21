/**
 * Targetprocess bookable entity (task or bug) common model for consumption within this utility.
 * Ian French, NewOrbit Ltd, Jan 2025.
 */

import { TpUserStory } from './tp-user-story';

/**
 * Enumeration of the possible entity types, extracted from the "ResourceType" property of the TP entity.
 */
export enum EntityType {
  BUG = "Bug",
  TASK = "Task"
}


/**
 * Targetprocess bookable entity (task or bug) common model. Straight from TP, properties start with
 * capital letters. This model represents only a small fraction of the available properties.
 */
export interface TpBookableEntity {
  Id: number;
  Name: string;  // this will be the bookable item (task or issue) name
  ResourceType?: EntityType;
  TimeRemain?: number;
  TimeSpent?: number;
  Units?: string;
  UserStory: TpUserStory;
}
