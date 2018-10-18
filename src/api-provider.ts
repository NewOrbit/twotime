import Configstore = require("configstore");
import { HarvestApi } from "./harvest/api";
import { Targetprocess } from "targetprocess-rest-api";
import { log } from "./utils/log";

interface HarvestConfig {
    accessToken: string;
    accountId: number;
}

interface TargetprocessConfig {
    username: string;
    password: string;
}

const CONFIG_KEYS = {
    TWOTIME: "twotime",
    HARVEST: "harvest",
    TARGETPROCESS: "targetprocess"
};

export class ApiProvider {
    private store: Configstore;
    private harvestApi: HarvestApi;
    private targetprocessApi: Targetprocess;

    constructor() {
        this.store = new Configstore(CONFIG_KEYS.TWOTIME);

        this.harvestApi = null;
        this.targetprocessApi = null;
    }

    public getHarvestApi() {
        if (this.harvestApi !== null) {
            return this.harvestApi;
        }

        const config = this.getHarvestConfig();

        if (config === null) {
            log.error("Harvest authentication not configured correctly.");
            log.error("Use `twotime auth` to authenticate.");
            process.exit(1);
        }

        const api = new HarvestApi(config.accessToken, config.accountId);

        this.harvestApi = api;

        return this.harvestApi;
    }

    public getTargetprocessApi() {
        if (this.targetprocessApi !== null) {
            return this.targetprocessApi;
        }

        const config = this.getTargetprocessConfig();

        if (config === null) {
            log.error("Targetprocess authentication not configured correctly.");
            log.error("Use `twotime auth` to authenticate.");
            process.exit(1);
        }

        const api = new Targetprocess("neworbit", config.username, config.password);

        this.targetprocessApi = api;

        return this.targetprocessApi;
    }

    public setHarvestConfig(accessToken: string, accountId: number) {
        const config: HarvestConfig = {
            accessToken, accountId
        };

        this.store.set(CONFIG_KEYS.HARVEST, config);
    }

    public setTargetprocessConfig(username: string, password: string) {
        const config: TargetprocessConfig = {
            username, password
        };

        this.store.set(CONFIG_KEYS.TARGETPROCESS, config);
    }

    private getHarvestConfig() {
        const config = this.store.get(CONFIG_KEYS.HARVEST);

        if (!config) {
            return null;
        }

        return config as HarvestConfig;
    }

    private getTargetprocessConfig() {
        const config = this.store.get(CONFIG_KEYS.TARGETPROCESS);

        if (!config) {
            return null;
        }

        return config as TargetprocessConfig;
    }
}
