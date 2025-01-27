import Configstore from "configstore";

import { Targetprocess } from "targetprocess-rest-api";

import { HarvestApi } from "./harvest/api";

import { log } from "./utils/log";

interface HarvestConfig {
    accessToken: string;
    accountId: number;
}

export interface TargetprocessConfig {
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
    private harvestApi: HarvestApi | null;
    private targetprocessApi: Targetprocess | null;

    // An optional DI makes testing a little easier.
    constructor(store?: Configstore) {
        this.store = store || new Configstore(CONFIG_KEYS.TWOTIME);
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

        const tpConfig = this.getTargetprocessConfig();
        if (tpConfig === null || !tpConfig.username || !tpConfig.password || !tpConfig.subdomain) {
            log.error("Targetprocess authentication not configured correctly.");
            log.error("Use `twotime auth` to authenticate.");
            process.exit(1);
        }

        const api = new Targetprocess(tpConfig.subdomain, tpConfig.username, tpConfig.password);

        this.targetprocessApi = api;

        return this.targetprocessApi;
    }

    public setHarvestConfig(config: HarvestConfig) {
        this.store.set(CONFIG_KEYS.HARVEST, config);
    }

    public setTargetprocessConfig(config: TargetprocessConfig) {
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
        const defaultSubdomain = "neworbit";
        const config = this.store.get(CONFIG_KEYS.TARGETPROCESS);
        if (!config) {
            return null;
        }

        // Existing configs won't have subdomain setting, so put it there with existing default.
        if (!config.subdomain) {
            config.subdomain = defaultSubdomain;
            log.info(`Setting TargetProcess to default TP subdomain, '${config.subdomain}'`);
            this.setTargetprocessConfig(config);
        }

        if (config.subdomain !== defaultSubdomain) {
            log.warn(`twotime is currently configured for non-NewOrbit TP subdomain, '${config.subdomain}'`);
        }

        return config as TargetprocessConfig;
    }
}
