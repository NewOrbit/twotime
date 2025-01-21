/**
 * Targetprocess utilities.
 * Ian French, NewOrbit Ltd, Jan 2025.
 */

import { EntityType, TpBookableEntity } from '../models/tp-bookable-entity';

/**
 * Construct a TP bookable item (entity) from the incoming user story and entity values.
 * @param userStoryid numerical user story ID
 * @param userStoryName user story name
 * @param entityId numerical entity ID
 * @param entityName entity name i.e. the task or bug name
 * @param entityType the entity type, see EntityType enum
 * @returns {TpBookableEntity} the constructed TP bookable entity
 */
export const constructTpEntity = (userStoryid: number, userStoryName: string, entityId: number, entityName: string, entityType: EntityType) => {
  const tpEntity: TpBookableEntity = {
    Id: entityId,
    Name: entityName,
    ResourceType: entityType,
    UserStory: {
      Id: userStoryid,
      Name: userStoryName,
      ResourceType: 'UserStory'
    }
  };

  return tpEntity;
};
