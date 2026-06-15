import { Get, Post,Put,Patch } from "./fetcher"

export async function getCategories(offset=0,limit=10)
{
    const response=await Get(`/api/categories?limit=${limit}&offset=${offset}`)

    if(response.status!==200)
        throw new Error(response.json.message)

    return response.json
}

export async function createCategory(category) 
{
 
    const response=await Post("/api/categories",JSON.stringify(category))
    if(response.status>=400)
        throw new Error(response.json.message)

    return response.json

}

export async function updateCategory(category) 
{

    const response=await Put(`/api/categories/${category.categoryId}`,JSON.stringify(category))
    if(response.status>=400)
        throw new Error(response.json.message)

    return response.json

}

export async function activateCategory(id)
{

    const response=await Patch(`/api/categories/${id}/activate`)

    if(response.status>=400)
        throw new Error(response.json.message)

    return response.json

}

export async function deactivateCategory(id)
{

    const response=await Patch(`/api/categories/${id}/deactivate`)

    if(response.status>=400)
        throw new Error(response.json.message)

    return response.json

}

