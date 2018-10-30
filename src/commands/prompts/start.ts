import * as inquirer from "inquirer";
import { HarvestProject, HarvestApi } from "../../harvest/api";
import { Targetprocess } from "targetprocess-rest-api";
import { getTargetprocessEntity } from "../../utils/get-tp-entity";
import { askConfirm } from "./confirm";
import { log } from "../../utils/log";
import { ApiProvider } from "../../api-provider";
import { startArrayAt } from "../../utils/start-array-at";

const promptTargetprocessId = async () => {
    const { tpEntityId } = await inquirer.prompt<{ tpEntityId: any }>({
        name: "tpEntityId",
        message: "Enter a Targetprocess task or bug ID"
    });

    if (tpEntityId === null || tpEntityId.length === 0 || isNaN(tpEntityId)) {
        return null;
    }

    return parseInt(tpEntityId, 10);
};

const logTpEntity = (entity: any) => {
    if (entity === null) {
        return;
    }

    if (entity.UserStory) {
        log.info(`> user story: #${entity.UserStory.Id} ${entity.UserStory.Name}`);
    } else {
        log.info("> user story: none");
    }

    log.info(`> ${entity.ResourceType.toLowerCase()}: #${entity.Id} ${entity.Name}`);
};

const askTargetprocessEntity = async (targetprocessApi: Targetprocess) => {
    // keep asking the question until the user gives nothing or a valid TP id
    while (true) {
        const tpEntityId = await promptTargetprocessId();

        if (tpEntityId === null) {
            log.info("Starting timer without linked Targetprocess entity");
            return null;
        }

        const entity = await getTargetprocessEntity(targetprocessApi, tpEntityId);

        if (entity === null) {
            log.error(`Targetprocess entity ${ tpEntityId } could not be found or access is forbidden.`);

            // ask for it again
            continue;
        }

        if (entity.ResourceType === "UserStory") {
            log.error("You cannot log time directly to a user story");

            // ask for it again
            continue;
        }

        return entity;
    }
};

const filterChoices = (choices: { name: string }[], input: string) => {
    return new Promise(resolve => {
        if (!input) {
            return resolve(choices);
        }

        const uppercaseInput = input.toUpperCase();
        const matching = choices.filter(p => p.name.toUpperCase().indexOf(uppercaseInput) !== -1);

        return resolve(matching);
    });
};

const getChoiceIndexForName = (choices: { value: any, name: string }[], name: string) => {
    const totalMatch = choices.findIndex(c => c.name.toUpperCase() === name.toUpperCase());

    if (totalMatch !== -1) {
        return totalMatch;
    }

    const startsWithMatch = choices.findIndex(c => c.name.toUpperCase().startsWith(name.toUpperCase()));

    if (startsWithMatch !== -1) {
        return startsWithMatch;
    }

    return -1;
};

const reorderChoices = (choices: { value: any, name: string }[], name: string) => {
    const index = getChoiceIndexForName(choices, name);

    if (index === -1) {
        return choices;
    }

    return startArrayAt(choices, index);
};

const askHarvestDetails = async (harvest: HarvestApi) => {
    const projects = await harvest.getProjects();

    const projectChoices = projects.map(p => ({ value: p, name: p.name }));

    const { project } = await inquirer.prompt<{ project: HarvestProject, taskId: number }>([{
        name: "project",
        message: "Which project?",
        type: "autocomplete",
        source: (answers: any, input: string) => filterChoices(projectChoices, input)
    } as any ]);

    const taskChoices = project.tasks.map(t => ({ value: t.id, name: t.name }));

    const { taskId } = await inquirer.prompt<{ taskId: number }>([{
        name: "taskId",
        message: "What kind of task?",
        type: "autocomplete",
        source: (answers: any, input: string) => filterChoices(taskChoices, input)
    } as any ]);

    return {
        projectId: project.id,
        taskId
    };
};

const askNotes = async () => {
    const { notes } = await inquirer.prompt<{ notes: string }>({
        name: "notes",
        message: "Notes:"
    });

    return notes;
};

const askTimeSpent = async () => {
    const { hours, running } = await inquirer.prompt<{ hours: number, running: boolean }>([{
        name: "hours",
        default: 0,
        message: "How many hours have you already spent on it?"
    }, {
        name: "running",
        type: "confirm",
        message: "Are you still doing this?",
        when: answers => answers.hours !== 0
    }]);

    return {
        hours,
        running: hours === 0 || running
    };
};

export const askStartDetails = async (apiProvider: ApiProvider) => {
    const tp = apiProvider.getTargetprocessApi();
    const harvest = apiProvider.getHarvestApi();

    const entity = await askTargetprocessEntity(tp);
    logTpEntity(entity);

    const { projectId, taskId } = await askHarvestDetails(harvest);
    const notes = await askNotes();
    const { hours, running } = await askTimeSpent();
    const confirm = await askConfirm();

    if (!confirm) {
        return null;
    }

    return {
        entity,
        projectId,
        taskId,
        notes,
        hours,
        running
    };
};
