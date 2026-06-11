const baseRoute = import.meta.env.VITE_BASE_ROUTE || 'http://localhost:3000'

async function request(method, path, body) {
    const cleanPath = path.trim()
        .replace(/^http(s?):\/\/\w[\w.]+:\d+/, '');

    const res = await fetch(`${baseRoute}${cleanPath}`, {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
        credentials:'include',//envia y recibe cookies automaticamente
        body: body,
    });

    return {
        status: res.status, 
        json: await res.json()
    };
}

export function getSession()
{

    const match=document.cookie.match(/(?:^|;\s*)session=([^;]+)/)
    if(!match)return null
    try 
    {

        return JSON.parse(decodeURIComponent(match[1]))

    }catch{

        return null
        
    }

}


export const Get = async (path) => request('GET', path);
export const Put = async (path, body) => request('PUT', path, body);
export const Post = async (path, body) => request('POST', path, body);
export const Delete = async (path) => request('DELETE', path);
