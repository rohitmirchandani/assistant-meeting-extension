import {proxyApi, baseApi} from "./interceptor";

export async function getOrgs() {
    const response = await proxyApi.get('/c/getCompanies?itemsPerPage=100');
    return response.data;
}

export async function switchOrg(org: string){
    const response = await baseApi.get(`https://api.github.com/orgs/${org}`);
    return response.data;
}
