import { Get } from "./fetcher";

export async function getStores() 
{

    const response=await Get("/api/stores?limit=100&offset=0")
    if(response.status!==200){

        throw new Error(response.json.message)

    }
    return response.json

}