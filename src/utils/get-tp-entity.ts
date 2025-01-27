import { Targetprocess } from "targetprocess-rest-api";

import { log } from "../utils/log";

export const getTargetprocessEntity = async (api: Targetprocess, id: number) => {
    // tasks are most used, then bugs, then stories - so attempt to find them in that order

    try {
        const task = await api.getTask(id);

        return task;
    } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = err as any;  // VERY NASTY TEMPORARY HACK BEFORE THIS IS CLEANED UP - TODO!
        switch (e.statusCode) {
            case 401:
                log.error("TP returned 401: Please check your credentials and run `twotime auth`.");
                return null; // caller will exit cleanly for null as failure.
            case 404:
                break;
            default:
                throw e;
        }

        try {
            const bug = await api.getBug(id);

            return bug;
        } catch (err2) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const e2 = err2 as any;  // VERY NASTY TEMPORARY HACK BEFORE THIS IS CLEANED UP - TODO!!
            if (e2.statusCode !== 404) {
                throw e;
            }

            try {
                const story = await api.getStory(id);

                return story;
            } catch (err3) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const e3 = err3 as any;  // VERY NASTY TEMPORARY HACK BEFORE THIS IS CLEANED UP - TODO!!
                if (e3.statusCode !== 404) {
                    throw e3;
                }
            }
        }
    }

    return null;
};
