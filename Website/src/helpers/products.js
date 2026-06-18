import { Delete, Get,Post,Put } from "./fetcher"

export async function getProducts(offset=0,limit=10,category="",archived=false) 
{

    let url=`/api/products?limit=${limit}&offset=${offset}`

    if(category)
    {

        url+=`&category=${encodeURIComponent(category)}`

    }
    if(archived)
        url+="&archived=true"
    const response=await Get(url)


    if(response.status!==200)
        throw new Error(response.json.message)

    return response.json
    
}

export async function createProduct(product) 
{
 
    const response=await Post("/api/products",JSON.stringify(product))

    if(response.status>=400)
        throw new Error(response.json.message)

    return response.json

}

export async function updateProduct(product) 
{
 
    const response=await Put(`/api/products/${product.productId}`,JSON.stringify(product))

    if(response.status>=400)
        throw new Error(response.json.message)

    return response.json

}


export async function deleteProduct(id,storeId=null) 
{
 
    let url=`/api/products/${id}`
    if(storeId)
    {

        url+=`?storeId=${storeId}`

    }
    const response=await Delete(url)
    if(response.status>=400)
        throw new Error(response.json.message)

    return response.json

}

export async function restoreProduct(id) 
{

    const response=await Post(`/api/products/${id}/recover`)

    if(response.status>=400)
        throw new Error(response.json.message)

    return response.json

}