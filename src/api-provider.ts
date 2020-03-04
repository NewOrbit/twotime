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
    subdomain: string;
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
        log.info(`Getting config from ${this.store.path}`);

        this.harvestApi = null;
        this.targetprocessApi = null;
    }

    public getHarvestApi() {
        if (this.harvestApi !== null) {
            return this.harvestApi;
        }

        const config = this.getHarvestConfig();

        if (config === null || config.accessToken === null || config.accountId === null) {
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

        const { username, password, subdomain } = this.getTargetprocessConfig();

        if (username === null || password === null || subdomain === null) {
            log.error("Targetprocess authentication not configured correctly.");
            log.error("Use `twotime auth` to authenticate.");
            process.exit(1);
        }

        const api = new Targetprocess(subdomain, username, password);

        this.targetprocessApi = api;

        return this.targetprocessApi;
    }

    public setHarvestConfig(accessToken: string, accountId: number, ) {
        const config: HarvestConfig = {
            accessToken, accountId
        };

        this.store.set(CONFIG_KEYS.HARVEST, config);
    }

    public setTargetprocessConfig(username: string, password: string, subdomain: string) {
        const config: TargetprocessConfig = {
            username, password, subdomain
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

        // Existing configs won't have subdomain setting, so put it there with existing default.
        if (!config.subdomain) {
            config.subdomain = "neworbit";
            log.info(`Setting TargetProcess to default TP subdomain, '${config.subdomain}'`);
            this.setTargetprocessConfig(config.username, config.password, config.subdomain);
        }

        if (config.subdomain != "neworbit") {
            log.warn(`twotime is currently configured for non-neworbit TP subdomain, '${config.subdomain}'`);
        }

        return config as TargetprocessConfig;
    }
}
