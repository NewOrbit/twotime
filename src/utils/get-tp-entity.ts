import { Targetprocess } from "targetprocess-rest-api";

import { TpBookableEntity } from "../target-process/models/tp-bookable-entity";

import { log } from "../utils/log";

interface TpException {
    statusCode: number;
    message: string;
}

/**
 * Find a Targetprocess bookable entity by ID
 * @param {Targetprocess} api the TP API service
 * @param {number} id the TP item ID
 * @returns {TpBookableEntity | null} the found TP bookable entity (task or bug) or null if not found.
 */
export const getTargetprocessEntity = async (api: Targetprocess, id: number) => {
    // Tasks are most used, then bugs, so attempt to find them in that order. Try user story as a last resort.

    try {
        const task = await api.getTask(id) as TpBookableEntity;
        return task;
    } catch (ex) {
        const err = ex as TpException;
        switch (err.statusCode) {
            case 401:
                log.error("TP returned 401: Please check your credentials and run `twotime auth`.");
                return null; // caller will exit cleanly for null as failure.
            case 404:
                break;
            default:
                throw ex;
        }
    }

    // If reached here, trying for a task must have thrown a 404 not-found. Try a bug next.
    try {
        const bug = await api.getBug(id) as TpBookableEntity;
        return bug;
    } catch (ex) {
        const err = ex as TpException;
        if (err.statusCode !== 404) {
            throw ex;
        }
    }

    // If reached here, trying for a bug must have thrown a 404 not-found. Try a user story as a last resort.
    try {
        const story = await api.getStory(id) as TpBookableEntity;  // not a bookable entity but we can use the type
        return story;
    } catch (ex) {
        const err = ex as TpException;
        if (err.statusCode !== 404) {
            throw ex;
        }
    }

    return null;
};
