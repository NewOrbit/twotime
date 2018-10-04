import { Targetprocess } from "targetprocess-rest-api";

export const getTargetprocessEntity = async (api: Targetprocess, id: number) => {
    // tasks are most used, then bugs, then stories - so attempt to find them in that order

    try {
        const task = await api.getTask(id);
        
        return task;
    } catch (e) {
        if (e.statusCode !== 404) {
            throw e;
        }

        try {
            const bug = await api.getBug(id);

            return bug;
        } catch (e) {
            if (e.statusCode !== 404) {
                throw e;
            }

            try {
                const story = await api.getStory(id);
                
                return story;
            } catch (e) {
                if (e.statusCode !== 404) {
                    throw e;
                }
            }
        }
    }

    return null;
};
