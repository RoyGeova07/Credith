import "./Imageuploadfield.css"
import { useRef,useState } from "react"
import { uploadImage } from "@/helpers/cloudinary"

export default function ImageUploadField({value,onUpload})
{

    const fileInputRef=useRef(null)
    const[uploading,setUploading]=useState(false)
    const handleFileChange=async(e)=>
    {

        const file=e.target.files[0]
        if(!file)
            return

        const allowedTypes=["image/png","image/jpeg","image/jpg","image/webp",]

        if(!allowedTypes.includes(file.type))
        {

            alert("Formato de imagen no permitido")
            return

        }
        if(file.size>5*1024*1024)
        {

            alert("La imagen no puede superar 5 MB")
            return

        }

        try
        {

            setUploading(true)
            const url=await uploadImage(file)
            onUpload?.(url)

        }catch(error){

            console.error(error)
            alert(error.message)

        }finally{

            setUploading(false)
            fileInputRef.current.value=""

        }

    }

    return(

        <div className="image-upload-field field-group full">

            <label>Imagen URL</label>

            <div className="image-upload-row">

                <input 

                    type="text"
                    placeholder="La URL se generará automáticamente"
                    value={value}
                    readOnly

                />

                <input

                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    style={{display:"none"}}
                    onChange={handleFileChange}

                />
                    
                <button

                    type="button"
                    className="upload-btn"
                    disabled={uploading}
                    onClick={()=>fileInputRef.current?.click()}

                >

                    <svg

                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"

                    >

                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>

                        <polyline points="17 8 12 3 7 8"/>

                        <line x1="12" y1="3" x2="12" y2="15"/>

                    </svg>
 
                    {

                        uploading?"Subiendo":"Subir"

                    }

                </button>

                

            </div>

            <span className="upload-hint">

                Formatos aceptados: JPG, JPEG, PNG, WEBP

            </span>

            {

                value&&(

                    <div className="image-preview-container">

                        <span className="preview-title">

                            Vista previa

                        </span>

                        <div className="image-preview">

                            <img 

                                src={value}
                                alt="Vista Previa"

                            />

                        </div>

                    </div>

                )

            }

        </div>

    )

}