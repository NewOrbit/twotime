/**
 * Thin wrapper around the Targetprocess REST API.
 * Vendored from NewOrbit's targetprocess-rest-api npm package (v1.1.1) so the
 * CLI uses native fetch instead of the package's node-fetch@2 dependency tree.
 * The unused basic-auth path was dropped; errors keep the original
 * { statusCode, message } shape that callers match on.
 */

import { log } from "../utils/log.ts";

import { TargetprocessApiError } from "./api-error.ts";

const APIVersion = {
    V1: "V1",
    V2: "V2"
} as const;

type APIVersion = typeof APIVersion[keyof typeof APIVersion];

export class Targetprocess {
    private subdomain: string;
    private accessToken: string;
    private headers: {
        [index: string]: string;
    };

    constructor(subdomain: string, accessToken: string) {
        this.subdomain = subdomain;
        this.accessToken = accessToken;

        this.headers = {
            "Accept": "application/json",
            "Cache-Control": "no-cache",
            "Content-Type": "application/json"
        };
    }

    public async getBug(id: number) {
        return this.requestJSON(APIVersion.V1, `Bugs/${id}`, "GET");
    }

    public async getTask(id: number) {
        return this.requestJSON(APIVersion.V1, `Tasks/${id}`, "GET");
    }

    public async getStory(id: number) {
        return this.requestJSON(APIVersion.V1, `Userstories/${id}`, "GET");
    }

    public async setTaskState(id: number, stateName: string, processId: number) {
        const doneEntity = await this.getTaskEntityState(stateName, processId);
        if (!doneEntity || !doneEntity.Items || !Array.isArray(doneEntity.Items) || doneEntity.Items.length > 1) {
            return;
        }

        const doneEntityId = doneEntity.Items[0].Id;

        const body = {
            EntityState: { Id: doneEntityId },
        };

        return this.requestJSON(APIVersion.V1, `Tasks/${id}`, "POST", body);
    }

    public async addTime(id: number, spent: number, remain: number, date: Date, description: string) {
        const body = {
            Spent: spent,
            Remain: remain,
            Date: date,
            Description: description,
            Assignable: {
                Id: id
            }
        };

        return this.requestJSON(APIVersion.V1, `Times/`, "POST", body);
    }

    public async getCustomValueForProject<T>(projectId: number, customValueKey: string) {
        const url = `Project/${projectId}`;
        const requestParams = new URLSearchParams({
            select: `{val:CustomValues["${customValueKey}"]}`
        });

        const response = await this.requestJSON(APIVersion.V2, url, "GET", undefined, requestParams);
        const item = response.items[0];

        if (item.val === undefined) {
            return null;
        }

        return item.val as T;
    }

    private async getTaskEntityState(name: string, processId: number) {
        try {
            const response = await this.requestJSON(
                APIVersion.V1,
                `EntityStates`,
                "GET",
                undefined,
                new URLSearchParams({
                    where: `Name eq '${name}' and Process.Id eq ${processId} and EntityType.Name eq 'Task'`,
                })
            );
            return response;
        } catch (e) {
            log.error(`Failed to get task entity state: ${e instanceof Error ? e.message : String(e)}`);
            return;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async requestJSON(version: APIVersion, endpoint: string, method: string, body?: any, requestParams?: URLSearchParams): Promise<any> {
        const url = this.getUrlForAPIVersion(version);
        const params = this.getUrlParams();

        if (requestParams) {
            requestParams.forEach((value, key) => {
                params.append(key, value);
            });
        }

        const fullUrl = `${url}/${endpoint}?${params}`;

        const res = await fetch(fullUrl, {
            method,
            headers: this.headers,
            body: body ? JSON.stringify(body) : undefined
        });

        if (!res.ok) {
            throw new TargetprocessApiError(res.status, res.statusText);
        }

        return res.json();
    }

    private getUrlForAPIVersion(version: APIVersion) {
        if (version === APIVersion.V1) {
            return `https://${this.subdomain}.tpondemand.com/api/v1`;
        }

        return `https://${this.subdomain}.tpondemand.com/api/v2`;
    }

    private getUrlParams(): URLSearchParams {
        const params = new URLSearchParams();

        if (this.accessToken) {
            params.append("access_token", this.accessToken);
        }

        return params;
    }
}
