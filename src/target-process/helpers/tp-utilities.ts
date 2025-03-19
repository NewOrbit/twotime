/**
 * Targetprocess utilities.
 * Ian French, NewOrbit Ltd, Jan 2025.
 */

import { EntityType, TpBookableEntity } from "../models/tp-bookable-entity";

/**
 * Construct a TP bookable item (entity) from the incoming user story and entity values.
 * @param {number} userStoryid numerical user story ID (may be blank)
 * @param {string} userStoryName user story name (may be blank)
 * @param {number} entityId numerical entity ID
 * @param {string} entityName entity name i.e. the task or bug name
 * @param {EntityType} entityType the entity type, see EntityType enum
 * @returns {TpBookableEntity} the constructed TP bookable entity
 */
export const constructTpEntity = (userStoryid: number, userStoryName: string, entityId: number, entityName: string, entityType: EntityType) => {
  const userStory = userStoryid && userStoryName ?
    {
      Id: userStoryid,
      Name: userStoryName,
      ResourceType: "UserStory"
    } : undefined;

  const tpEntity: TpBookableEntity = {
    Id: entityId,
    Name: entityName,
    ResourceType: entityType,
    UserStory: userStory
  };

  return tpEntity;
};
