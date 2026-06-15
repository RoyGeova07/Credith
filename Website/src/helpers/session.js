export function getSession()
{

    const cookie=document.cookie.split("; ").find(row=>row.startsWith("session="))
    if(!cookie)return null

    try
    {

        return JSON.parse(decodeURIComponent(cookie.split("=")[1]))

    }catch{

        return null

    }

}

export function getUserRole()
{

    const session=getSession()
    if(!session)
        return "EMPLOYEE"

    return session.role||"EMPLOYEE"

}