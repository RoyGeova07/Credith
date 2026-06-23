import { useCallback, useState } from "react"
import { Archive } from "@/assets/icons"
import {DataGrid,DataGridHeader,HeaderTextFilter,} from "@/components/dataGrid/DataGrid"
import {ActionColumn,CustomAction,DataColumn,DataTable,UpdateAction,} from "@/components/dataGrid/DataTable"
import FormDialog from "@/components/dialogs/SubmitDialog"
import { getCategories,createCategory,updateCategory,activateCategory,deactivateCategory } from "@/helpers/categories"
import"./OwnerCategoryManagementPage.css"
import { toast } from "react-toastify"

const emptyForm={name:"",description:"",}

function normalizeCategory(category) 
{

  const isActive=category.isActive!==false

  return{

    categoryId: category.categoryId,
    name: category.name || "",
    description: category.description || "",
    isActive,
    statusLabel: isActive ? "Activa" : "Inactiva",

  }

}

export default function OwnerCategoryManagementPage()
{

    const[filter,setFilter,]=useState("")
    const[form,setForm]=useState(emptyForm)
    const[editingCategory,setEditingCategory]=useState(null)
    const [isDialogOpen,setIsDialogOpen]=useState(false)
    const [refreshKey,setRefreshKey]=useState(0)
    const [error,setError]=useState("")
    const [confirmOpen,setConfirmOpen]=useState(false)
    const [pendingCategory,setPendingCategory]=useState(null)

    const loadCategories=useCallback(

        async(offset,limit)=>
        {

            try
            {

                const response=await getCategories(0,500)
                const categories=(response.data||[]).map(normalizeCategory)
                const term=filter.trim().toLocaleLowerCase()
                const filteredCategories=!term?categories:categories.filter((category)=>[category.name,category.description,category.statusLabel].join(" ").toLocaleLowerCase().includes(term))

                return{

                    data:filteredCategories.slice(offset,offset+limit),
                    total:filteredCategories.length,

                }

            }catch(requestError){

                toast.error(requestError.message)

                return{

                    data:[],
                    total:0,

                }

            }

        },[filter,refreshKey]//NO TOCAR ESTE WARNING, SIN ESTO NO SE REFRESCARA LA TABLA DEPUES DE HACER X ACCION

    )

    const handleFormChange=(event)=>
    {

        setForm((current)=>
        ({

            ...current,[event.target.name]:event.target.value,

        }))

        setError("")

    }

    const openNewDialog=()=>
    {

        setEditingCategory(null)
        setForm(emptyForm)
        setError("")
        setIsDialogOpen(true)

    }

    const openEditDialog=(categorie)=>
    {

        setEditingCategory(categorie)
        setForm({

            name:categorie.name,
            description:categorie.description,

        })

        setError("")
        setIsDialogOpen(true)

    }

    const buildPayload=()=>
    {

        if(!form.name.trim())
            throw new Error("El nombre es requerido")

        if(!form.description.trim())
            throw new Error("La descripcion es requerida")

        return{

            name:form.name.trim(),
            description:form.description.trim(),

        }

    }

    const handleAccept=async()=>
    {

        try
        {

            const payload=buildPayload()

            if(editingCategory)
            {

                await updateCategory({categoryId:editingCategory.categoryId,...payload})
                toast.success("Categoria actualizada correctamente")

            }else{

                await createCategory(payload)
                toast.success("Categoria creada correctamente")

            }
            setRefreshKey((current)=>current+1)
            setIsDialogOpen(false)

        }catch(error){

            setError(error.message)
            toast.error(error.message)

        }

    }

    const handleToggleStatus=(category)=>
    {

        setPendingCategory(category)
        setConfirmOpen(true)

    }

    const doToggleStatus=async()=>
    {

        if(!pendingCategory) return
        setConfirmOpen(false)
        const category=pendingCategory
        setPendingCategory(null)

        try{

            if(category.isActive)
                await deactivateCategory(category.categoryId)
            else
                await activateCategory(category.categoryId)

            setRefreshKey((current)=>current+1)

            toast.success(category.isActive?"Categoria desactivada correctamente":"Categoria activa correctamente")

        }catch(error){

            toast.error(error.message)

        }

    }

    const handleClose=()=>
    {

        setIsDialogOpen(false)
        setError("")

    }

    return(

        <div className="category-admin-page">

            <DataGrid>

                <DataGridHeader

                    title="Categorias"
                    description="Administracion"
                    addButtonTxt="Nueva categoria"
                    onAddClick={openNewDialog}

                >

                    <HeaderTextFilter

                        className="grid-main-filter"
                        filterPlaceholder="Nombre o descripcion"
                        value={filter}
                        onChange={setFilter}

                    />

                </DataGridHeader>

                <DataTable 

                    onLoad={loadCategories}
                    rowTitle="Click para editar"
                    onRowClick={openEditDialog}

                >

                    <DataColumn

                        propertyName="name"
                            title="Nombre"

                    />

                    <DataColumn

                        propertyName="description"
                        title="Descripción"

                    />

                    <DataColumn

                        propertyName="statusLabel"
                        title="Estado"

                    />

                    <ActionColumn>

                        <UpdateAction

                            onClick={openEditDialog}

                            />

                        <CustomAction

                            backgroundColor="#d97706"
                            color="#ffffff"
                            icon={Archive}
                            tooltip="Cambiar estado"
                            onClick={handleToggleStatus}

                        />

                    </ActionColumn>

                </DataTable>

                <FormDialog

                    title={editingCategory?"Editar categoria":"Nueva categoria"}
                    isOpen={isDialogOpen}
                    setIsOpen={setIsDialogOpen}
                    onAccept={handleAccept}
                    acceptText="Guardar"
                    onClose={handleClose}
                    closeText="Cancelar"

                >

                    <form className="category-dialog-form">

                        <label>

                            Nombre

                            <input 

                                name="name"
                                value={form.name}
                                onChange={handleFormChange}
                                placeholder="Tecnologia"

                            />

                        </label>

                        <label>

                            Descripcion
                                
                            <input
                                
                                name="description"
                                value={form.description}
                                onChange={handleFormChange}
                                placeholder="Categoría de productos tecnológicos"

                            />

                        </label>

                        {

                            error&&<small className="category-error">{error}</small>

                        }

                    </form>

                </FormDialog>

                <FormDialog

                    title="Confirmar acción"
                    isOpen={confirmOpen}
                    setIsOpen={setConfirmOpen}
                    onAccept={doToggleStatus}
                    acceptText="Confirmar"
                    onClose={()=>{ setConfirmOpen(false); setPendingCategory(null) }}
                    closeText="Cancelar"

                >

                    <p>
                        {pendingCategory?.isActive
                            ?`¿Desactivar la categoría ${pendingCategory.name}?`
                            :`¿Activar la categoría ${pendingCategory?.name}?`}
                    </p>

                </FormDialog>

            </DataGrid>

        </div>

    )

}