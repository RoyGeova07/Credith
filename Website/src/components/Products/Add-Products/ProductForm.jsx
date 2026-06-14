import { useState,useEffect } from 'react'
import SubmitDialog from '@/components/dialogs/SubmitDialog'
import FormField from '@/components/form/FormField'
import FormGrid from '@/components/form/FormGrid'
import MultiSelect from '@/components/multiSelect/MultiSelect'
import ImageUploadField from './Imageuploadfield'
import { ProductFormConfig } from '@/pages/constants/ProductFormConfig'
import './ProductForm.css'
import { getCategories } from '@/helpers/categories'
import { createProduct, updateProduct } from '@/helpers/products'
import { toast } from 'react-toastify'

export default function ProductForm({isOpen,setIsOpen,onCreated,product=null,setSelectedProduct})
{

    const[form,setForm]=useState(ProductFormConfig.INITIAL_FORM)
    const[errors,setErrors]=useState({})
    const[touched,setTouched]=useState({})
    const[saving,setSaving]=useState(false)//evitar doble click
    const[uploadingImage,setUploadingImage]=useState(false)


    const handleChange=(field)=>(e)=>
    {

        setForm(prev=>({...prev,[field]:e.target.value}))

    }

    useEffect(() => 
    {

        if(product)
        {

            setForm({

                name:product.name,
                description:product.description,
                buyPrice:Number(product.buyPrice),
                sellPrice:Number(product.sellPrice),
                minGainPercentage:product.minGainPercentage,
                imageUrl:product.imageUrl,
                categories:product.categories.map(c=>({value:c.categoryId,label: c.name}))

            })

        }else{

            setForm(ProductFormConfig.INITIAL_FORM)

        }

    }, [product])

    const handleBlur=(field)=>()=>
    {

        setTouched(prev=>({...prev,[field]:true}))
        const errs=ProductFormConfig.validateProduct(form)
        setErrors(errs)

    }

    //------------------cambiar despues si se quiere crear producto con varios tipos de categorias--------------------------------
    const handleCategories=(selected)=>
    {

        const value=selected&&selected.length>0?[selected[selected.length-1]]:[]
        setForm(prev => ({...prev,categories: value}))
        setTouched(prev => ({...prev,categories: true}))
        setErrors(ProductFormConfig.validateProduct({...form,categories: value}))

    }

    //cargar categorias       'se agrega '_' por que no se usa el parametro
    const loadCategories=async(search,_loadedOptions,{page})=>
    {

        const result=await getCategories()
        const options=result.data.map(category=>
        ({

            value:category.categoryId,
            label:category.name

        })).filter(category=>

            category.label.toLowerCase().includes(search.toLowerCase())

        )

        return{

            options,
            hasMore:false,
            additional:{page:page+1}

        }

    }

    const handleUpload=async(url)=>
    {

        setForm(prev=>({...prev,imageUrl:url}))

    }

    const handleClose=()=>
    {

        setIsOpen(false)
        setSelectedProduct?.(null)
        setForm(ProductFormConfig.INITIAL_FORM)
        setErrors({})
        setTouched({})

    }

    //crear producto
    const handleAccept=async()=>
    {

        if(uploadingImage)
        {

            toast.warning("Espere a que termine de subirse la imagen")
            return

        }
        setSaving(true)
        const allTouched=Object.keys(ProductFormConfig.INITIAL_FORM).reduce((acc, key)=>({ ...acc,[key]:true}),{})
        setTouched(allTouched)
        const errs=ProductFormConfig.validateProduct(form)
        setErrors(errs)
        if(Object.keys(errs).length>0)
        {
            
            setSaving(false)
            return

        }
        try
        {

            if(product)
            {

                await updateProduct({

                   productId: product.productId,
                    name: form.name,
                    description: form.description,
                    buyPrice: Number(form.buyPrice),
                    sellPrice: Number(form.sellPrice),
                    minGainPercentage: Number(form.minGainPercentage),
                    imageUrl: form.imageUrl,
                    categoryId: form.categories[0]?.value

                })
                toast.success(`${form.name} actualizado exitosamente`)

            }else{

                await createProduct({

                    name: form.name,
                    description: form.description,
                    buyPrice:
                    Number(form.buyPrice),
                    sellPrice:
                    Number(form.sellPrice),
                    minGainPercentage:
                    Number(form.minGainPercentage),
                    imageUrl:
                    form.imageUrl,
                    categoryId:
                    form.categories[0]?.value

                })
                toast.success(`Producto ${form.name} agregado exitosamente`)

            }

           
            setForm({...ProductFormConfig.INITIAL_FORM})//limpiar formulario
            setErrors({})
            setTouched({})
            handleClose()
            onCreated?.()//actualizar tabla
            

        }catch(error){

            alert(error.message)

        }finally{

            setSaving(false)

        }
        

    }

    return(

        <SubmitDialog

            title={product?"Editar Producto":"Agregar nuevo producto"}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            onAccept={handleAccept}
            onClose={handleClose}
            acceptDisabled={uploadingImage||saving}
            acceptText={uploadingImage?"Subiendo imagen...":saving?"Guardando...":product?"Actualizar producto":"Guardar producto"}
            closeText="Cancelar"

        >

            <div className="product-form">

                <FormGrid>

                    {/* Nombre — fila completa */}
                    <FormField

                        className="full"
                        inputName="name"
                        description="Nombre del producto"
                        placeholder="ej. Samsung Galaxy A54 5G"
                        value={form.name}
                        onChange={handleChange('name')}
                        onBlur={handleBlur('name')}
                        error={errors.name}
                        touched={touched.name}
                        required

                    />

                    {/**URL DE LA IMAGEN - FILA COMPLETA */}
                    <ImageUploadField

                        value={form.imageUrl}
                        onChange={handleChange('imageUrl')}
                        onUpload={handleUpload}
                        onUploadingChange={setUploadingImage}

                    />

                     {/* Descripcion — fila completa */}
                    <FormField

                        className="full"
                        inputName="description"
                        description="Descripción"
                        placeholder="Breve descripción del producto..."
                        value={form.description}
                        onChange={handleChange('description')}
                        onBlur={handleBlur('description')}
                        error={errors.description}
                        touched={touched.description}

                    />

                    {/* Precio de compra */}
                    <FormField

                        inputName="buyPrice"
                        description="Precio de compra"
                        placeholder="0.00"
                        type="number"
                        value={form.buyPrice}
                        onChange={handleChange('buyPrice')}
                        onBlur={handleBlur('buyPrice')}
                        error={errors.buyPrice}
                        touched={touched.buyPrice}
                        required

                    />
 
                    {/* Precio de venta */}
                    <FormField

                        inputName="sellPrice"
                        description="Precio de venta"
                        placeholder="0.00"
                        type="number"
                        value={form.sellPrice}
                        onChange={handleChange('sellPrice')}
                        onBlur={handleBlur('sellPrice')}
                        error={errors.sellPrice}
                        touched={touched.sellPrice}
                        required

                    />

                    {/**porcentaje minimo de ganancia */}
                    <div className="field-group full">

                        <label htmlFor="minGainPercentage">

                            Porcentaje minimo de ganancia

                        </label>

                        <div className="percent-wrapper">

                            <input

                                id="minGainPercentage"
                                name="minGainPercentage"
                                type="number"
                                placeholder="ej. 25"
                                value={form.minGainPercentage}
                                onChange={handleChange('minGainPercentage')}
                                onBlur={handleBlur('minGainPercentage')}
                                className={touched.minGainPercentage?errors.minGainPercentage? 'input-error':'input-ok':''}

                            />

                            <span className="percent-suffix">%</span>

                        </div>

                        {touched.minGainPercentage&&errors.minGainPercentage&&(

                            <span className="error-msg">

                                ⚠ {errors.minGainPercentage}

                            </span>



                        )}

                    </div>

                    {/**categorias */}
                    <div className="categories-field">

                        <label>Categorias</label>

                        <MultiSelect

                            title="Buscar y seleccionar categorías..."
                            selected={form.categories}
                            onSelect={handleCategories}
                            onLoad={loadCategories}
                            pageSize={10}
                        />

                        {

                            touched.categories&&errors.categories&&(

                                <span className="error-msg">

                                    ⚠ {errors.categories}

                                </span>

                            )

                        }


                    </div>

                </FormGrid>

            </div>

        </SubmitDialog>

    )

}
