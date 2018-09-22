import { HarvestApi } from "../harvest/api";
import { TargetProcessApi } from "../tp/api";

export const start = async (harvest: HarvestApi, tp: TargetProcessApi) => {
    console.log("starting!");

    const projects = await harvest.getProjects();

    console.log(projects);
};
