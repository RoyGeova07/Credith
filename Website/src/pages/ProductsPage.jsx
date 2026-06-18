import ProductFilters from "@/components/Products/ProductFilters"
import ProductHeader from "@/components/Products/ProductHeader"
import { useState, useEffect } from "react"
import "./ProductsPage.css"
import {DataTable,DataColumn,ActionColumn,UpdateAction,DeleteAction, RestoreAction,} from "@/components/dataGrid/DataTable"
import ProductForm from "@/components/Products/Add-Products/ProductForm"
import {deleteProduct, getProducts, restoreProduct} from "@/helpers/products"
import { getCategories } from "@/helpers/categories"
import defaultProductImage from "@/assets/image.png"
import { toast } from "react-toastify"
import { getStores } from "@/helpers/store"
import { getSession } from "@/helpers/session"

export default function ProductsPage()
{

    const[isOpen,setIsOpen]=useState(false)
    const[search,setSearch]=useState("")
    const[selectedCategory,setSelectedCategory]=useState("")
    const[categories,setCategories]=useState([])
    const[showCategories,setShowCategories]=useState(false)
    const[reload,setReload]=useState(0)
    const[selectedProduct,setSelectedProduct]=useState(null)
    const[showArchived,setShowArchived]=useState(false)
    const[stores,setStores]=useState([])
    const[selectedStore,setSelectedStore]=useState("")
    const session=getSession()
    const assginedStore=stores.find(store=>store.storeId===session?.storeId)//FILTRAR PARA LA TIENDA CON STOCK Y PRODUCTO PARA EL ADMIN LOGUEADO
    const isGeneralInventory=session?.role==="OWNER"&&!selectedStore

    //cargar tiendas y categorias
    useEffect(() =>
    {

        async function load()
        {

            try
            {

                const result=await getCategories()
                const storesResult=await getStores()
                setCategories(result.data||[])
                setStores(storesResult.data||[])

            }
            catch (error)
            {

                console.log(error)

            }

        }

        load()

    }, [])

    const handleEdit=(product)=> 
    {

        setSelectedProduct(product)
        setIsOpen(true)

    }
    const handleDelete=async(product)=>
    {

        try
        {
            //owner en inventario general
            if(session?.role==="OWNER"&&!selectedStore)
            {

                await deleteProduct(product.productId)
                toast.success(`Producto ${product.name} archivado globalmente`)

            }else{

                const storeId=session?.role==="ADMIN"?session.storeId:selectedStore
                await deleteProduct(product.productId,storeId)
                toast.success(`Prodcucto ${product.name} eliminado de la tienda`)

            }

            setReload(prev=>prev+1)//recargar tabla para actualizar

        }catch(error){

            toast.error(error.message)

        }

    }
    const handleRestore=async(product)=>
    {

        try
        {

            await restoreProduct(product.productId)
            toast.success(`Produto ${product.name} restaurado exitosamente`)
            setReload(prev=>prev+1)

            
        }catch(error){

            toast.error(error.message)

        }

    }

    return(

        <div className="products-page">

            <ProductHeader

                canCreate={session?.role==="OWNER"}
                onCreate={() => 
                {

                    if(session?.role==="ADMIN"){

                        toast.error("No tienes permiso para crear productos")
                        return

                    }
                    setSelectedProduct(null)
                    setIsOpen(true)

                }}

            />
            {

                session?.role==="ADMIN"&&assginedStore&&
                (

                    <div className="assigned-store-banner">

                        <strong>Sucursal asignada:</strong>
                        {" "}
                        Tienda {assginedStore.address}

                    </div>

                )

            }
            

            <ProductFilters

                search={search}
                onSearchChange={setSearch}

                onCategoriesClick={()=>setShowCategories(!showCategories)}

                //boton de archivar 
                showArchived={showArchived}
                onShowArchivedClick={()=>setShowArchived(prev=>!prev)}

                categories={categories}
                showCategories={showCategories}

                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                setShowCategories={setShowCategories}

                //filtrar por tienda
                stores={stores}
                selectedStore={selectedStore}
                setSelectedStore={setSelectedStore}
                isOwner={session?.role==="OWNER"}

            />

            <DataTable

                //Cada vez que reload cambie, React reconstruira el DataTable y volvera a cargar los productos
                key={`${reload}-${showArchived}`}
                onLoad={async(offset,limit) =>
                {

                    const result=await getProducts(offset,limit,selectedCategory,showArchived,selectedStore)

                    let data=result.data||[]

                    if(search)
                    {

                        data=data.filter(product=>

                            product.name.toLowerCase().includes(search.toLowerCase())

                        )

                    }

                    return{

                        data: data,
                        total: result.total,

                    }

                }}

            >

                <DataColumn

                    title="Product Name"

                    render={(row) => 
                    (

                        <div className="product-name-cell">

                            <div className="product-image-placeholder">

                                <img

                                    src={row.imageUrl || defaultProductImage}

                                    className="product-image"

                                    alt={row.name}

                                    onError={(e) =>
                                    {

                                        e.target.src = defaultProductImage

                                    }}

                                />

                            </div>

                            <div className="product-name-text">

                                <span className="product-name">
                                    {row.name}
                                </span>

                                <span className="product-category">

                                    {
                                        row.categories
                                            ?.map(c => c.name)
                                            .join(", ")
                                    }

                                </span>

                            </div>

                        </div>

                    )}

                />

                <DataColumn

                    propertyName="buyPrice"

                    title="Buy Price"

                    render={(row) =>

                        `L. ${Number(row.buyPrice).toFixed(2)}`

                    }

                />

                <DataColumn

                    propertyName="sellPrice"

                    title="Sell Price"

                    render={(row) =>

                        `L. ${Number(row.sellPrice).toFixed(2)}`

                    }

                />

                <DataColumn

                    title="Minimum Sell Price"

                    render={(row) =>
                    {

                        const percentage =
                            row.minGainPercentage ??
                            row.min_gain_percentage ??
                            0

                        const value =
                            Number(row.buyPrice) *
                            (1 + Number(percentage) / 100)

                        return `L. ${value.toFixed(2)}`

                    }}

                />

                <DataColumn

                    propertyName="inStock"

                    title="In Stock"

                    render={(row) =>
                    {

                        return (

                            row.inventories?.reduce(

                                (total,inventory)=>
                                    
                                    total+(inventory?.inStock||0),

                                0

                            )

                        )||0

                    }}

                />

                <ActionColumn>

                    {/**boton de actualizar */}

                    {

                        (session?.role==="ADMIN"||!isGeneralInventory)&&
                        (

                            <UpdateAction

                                onClick={handleEdit}

                            />

                        )

                    }

                    {

                        (session?.role==="OWNER"||session?.role==="ADMIN")&&
                        (

                            showArchived?
                            (

                                <RestoreAction

                                    onClick={handleRestore}

                                />

                            ):(

                                <DeleteAction

                                    onClick={handleDelete}

                                />

                            )

                        )

                    }

                
                </ActionColumn>

            </DataTable>

            <ProductForm

                //pasar los parametros en orden por la function de productsForm
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                onCreated={()=>setReload(prev=>prev+1)}
                product={selectedProduct}
                setSelectedProduct={setSelectedProduct}

            />

        </div>

    )

}