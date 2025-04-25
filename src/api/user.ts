import { UserDetails } from "./interfaces";
import { proxyApi } from "./interceptor";

export async function getUserAndOrgs() :  Promise<UserDetails>{
    const response = await proxyApi.get("/c/getDetails");
    return response.data.data[0];
}




