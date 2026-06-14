import { Get } from "./fetcher"

export async function getCategories()
{
    const response=await Get("/api/categories")

    if(response.status!==200)
        throw new Error(response.json.message)

    return response.json
}