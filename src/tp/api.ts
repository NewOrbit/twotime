const btoa = require("btoa");
const request = require("request-promise-json").request;

export class TargetProcessApi {
    private basicAuthenticationString: string;
    private url: string;

    constructor(username: string, password: string) {
        this.url = "https://neworbit.tpondemand.com/api/v1";
        this.basicAuthenticationString = btoa(`${username}:${password}`);
    }

    private getAjaxOptions(url: string) {
        return {
            url,
            type: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": "Basic " + this.basicAuthenticationString,
                "Cache-Control": "no-cache"
            }
        };
    }

    public async getBug(id: number) {
        const url = `${this.url}/Bugs/${id}`;
        const opts = this.getAjaxOptions(url);
        
        const res = await request(opts);
        console.log(res);
    }
}
