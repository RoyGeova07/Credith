/**
 * 
 *  1. Crear .env
    2. Crear src/helpers/cloudinary.js
    3. Modificar ImageUploadField
    4. Probar subida
    5. Integrar API crear producto
    6. Agregar imagen por defecto
 * 
 * 
 */

export async function uploadImage(file)
{

    const form_Data=new FormData()
    form_Data.append("file",file)
    form_Data.append("upload_preset",import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
    const cloud_Name=import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const response=await fetch(`https://api.cloudinary.com/v1_1/${cloud_Name}/image/upload`,
    {

        method:"POST",
        body:form_Data,

    })
    const data=await response.json()
    console.log(data)
    if(!response.ok)
    {

        throw new Error(data?.error?.message||"Error desconocido")

    }

    return data.secure_url

}