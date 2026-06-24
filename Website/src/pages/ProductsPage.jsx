import ProductFilters from "@/components/Products/ProductFilters"
import ProductHeader from "@/components/Products/ProductHeader"
import { useState, useEffect } from "react"
import "./ProductsPage.css"
import {DataTable,DataColumn,ActionColumn,UpdateAction,DeleteAction,RestoreAction,CustomAction,} from "@/components/dataGrid/DataTable"
import FormDialog from '@/components/dialogs/SubmitDialog'
import ProductForm from "@/components/Products/Add-Products/ProductForm"
import {deleteProduct, getProducts, restoreProduct} from "@/helpers/products"
import { getCategories } from "@/helpers/categories"
import defaultProductImage from "@/assets/image.png"
import { BoxIcon } from "@/assets/icons"
import { toast } from "react-toastify"
import { getStores } from "@/helpers/store"
import { getSession } from "@/helpers/session"
import { Patch } from "@/helpers/fetcher"

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
    const[stockDialogOpen,setStockDialogOpen]=useState(false)
    const[stockDialogProduct,setStockDialogProduct]=useState(null)
    const[stockValue,setStockValue]=useState("")
    const[transferDialogOpen,setTransferDialogOpen]=useState(false)
    const[transferDialogProduct,setTransferDialogProduct]=useState(null)
    const[transferFromStore,setTransferFromStore]=useState("")
    const[transferQuantity,setTransferQuantity]=useState("")
    const[transferToStore,setTransferToStore]=useState("")
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
    function getRowStock(row)
    {

        return row.inventories?.reduce(

            (total,inventory)=>total+(inventory?.inStock||0),

            0

        )||0

    }

    const handleOpenStockDialog=(product)=>
    {

        setStockDialogProduct(product)
        setStockValue(String(getRowStock(product)))
        setStockDialogOpen(true)

    }

    const handleUpdateStock=async()=>
    {

        if(!stockDialogProduct)return
        const storeId=session?.storeId||selectedStore
        if(!storeId)
        {

            toast.error("No hay tienda seleccionada")
            return

        }
        try
        {

            const response=await Patch("/api/store-inventory/stock",{

                productId:stockDialogProduct.productId,
                storeId,
                stock:Number(stockValue),

            })
            if(response.status!==200)
            {

                throw new Error(response.json.message||"Error al actualizar stock")

            }
            toast.success("Stock actualizado correctamente")
            setStockDialogOpen(false)
            setStockDialogProduct(null)
            setReload(prev=>prev+1)

        }catch(error)
        {

            toast.error(error.message)

        }

    }

    const handleOpenTransferDialog=(product)=>
    {

        setTransferDialogProduct(product)
        setTransferFromStore("")
        setTransferQuantity("")
        setTransferToStore("")
        setTransferDialogOpen(true)

    }

    const handleTransferStock=async()=>
    {

        if(!transferDialogProduct||!transferFromStore||!transferToStore||!transferQuantity)
        {

            toast.error("Completa todos los campos")
            return

        }
        if(transferFromStore===transferToStore)
        {

            toast.error("Las tiendas deben ser diferentes")
            return

        }
        try
        {

            const response=await Patch("/api/store-inventory/transfer",{

                productId:transferDialogProduct.productId,
                fromStoreId:transferFromStore,
                toStoreId:transferToStore,
                quantity:Number(transferQuantity),

            })
            if(response.status!==200)
            {

                throw new Error(response.json.message||"Error al transferir existencias")

            }
            toast.success("Existencias transferidas correctamente")
            setTransferDialogOpen(false)
            setTransferDialogProduct(null)
            setReload(prev=>prev+1)

        }catch(error)
        {

            toast.error(error.message)

        }

    }

    const handleRestore=async(product)=>
    {

        try
        {

            //oWNER en inventario general
            if(session?.role==="OWNER"&&!selectedStore)
            {

                await restoreProduct(product.productId)
                toast.success(`Producto ${product.name} restaurado globalmente`)

            }else{

                const storeId=session?.role==="ADMIN"?session.storeId:selectedStore
                await restoreProduct(product.productId,storeId)
                toast.success(`Producto ${product.name} restaurado en la tienda`)

            }
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

                    title="Producto"

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

                    title="Precio de compra"

                    render={(row) =>

                        `L. ${Number(row.buyPrice).toFixed(2)}`

                    }

                />

                <DataColumn

                    propertyName="sellPrice"

                    title="Precio de venta"

                    render={(row) =>

                        `L. ${Number(row.sellPrice).toFixed(2)}`

                    }

                />

                <DataColumn

                    propertyName="inStock"

                    title="Existencias"

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

                    {/**boton de actualizar stock — solo con tienda seleccionada */}

                    {

                        (session?.role==="ADMIN"||!isGeneralInventory)&&
                        (

                            <CustomAction

                                backgroundColor="#1a6b4a"
                                color="#ffffff"
                                icon={BoxIcon}
                                tooltip="Actualizar existencias"
                                onClick={handleOpenStockDialog}

                            />

                        )

                    }

                    {/**boton de transferir stock — solo inventario general */}

                    {

                        isGeneralInventory&&
                        (

                            <CustomAction

                                backgroundColor="#2563eb"
                                color="#ffffff"
                                icon={BoxIcon}
                                tooltip="Transferir existencias"
                                onClick={handleOpenTransferDialog}

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

            {/**dialogo de actualizar stock */}

            <FormDialog

                title={stockDialogProduct?`Actualizar existencias - ${stockDialogProduct.name}`:"Actualizar existencias"}
                isOpen={stockDialogOpen}
                setIsOpen={setStockDialogOpen}
                onAccept={handleUpdateStock}
                acceptText="Guardar"
                onClose={()=>{setStockDialogOpen(false);setStockDialogProduct(null)}}
                closeText="Cancelar"

            >

                <p>¿Cuántos {stockDialogProduct?.name} hay en existencia?</p>

                <input

                    type="number"
                    min="0"
                    value={stockValue}
                    onChange={(e)=>setStockValue(e.target.value)}
                    style={{width:"100%",padding:"11px 13px",border:"1.5px solid var(--gray-light)",borderRadius:"8px",fontFamily:"'Lato',sans-serif",fontSize:"0.95rem",marginTop:"8px"}}

                />

            </FormDialog>

            {/**dialogo de transferir stock */}

            <FormDialog

                title={transferDialogProduct?`Transferir existencias - ${transferDialogProduct.name}`:"Transferir existencias"}
                isOpen={transferDialogOpen}
                setIsOpen={setTransferDialogOpen}
                onAccept={handleTransferStock}
                acceptText="Transferir"
                onClose={()=>{setTransferDialogOpen(false);setTransferDialogProduct(null)}}
                closeText="Cancelar"

            >

                <label style={{display:"grid",gap:"6px",fontWeight:800,fontSize:"0.78rem",textTransform:"uppercase",color:"var(--text-mid)",marginTop:"8px"}}>

                    Tienda origen

                    <select value={transferFromStore} onChange={(e)=>setTransferFromStore(e.target.value)} style={{width:"100%",padding:"11px 13px",border:"1.5px solid var(--gray-light)",borderRadius:"8px",fontFamily:"'Lato',sans-serif",fontSize:"0.95rem",background:"#f8fbf9"}}>

                        <option value="">Seleccionar tienda</option>

                        {transferDialogProduct?.inventories?.map((inv)=>(

                            <option key={inv.storeId} value={inv.storeId}>

                                {inv.store?.address||inv.storeId} — {inv.inStock} unidades

                            </option>

                        ))}

                    </select>

                </label>

                <label style={{display:"grid",gap:"6px",fontWeight:800,fontSize:"0.78rem",textTransform:"uppercase",color:"var(--text-mid)",marginTop:"12px"}}>

                    Cantidad

                    <input

                        type="number"
                        min="0"
                        max={
                            transferDialogProduct?.inventories?.find(
                                (inv)=>inv.storeId===transferFromStore
                            )?.inStock||0
                        }
                        value={transferQuantity}
                        onChange={(e)=>setTransferQuantity(e.target.value)}
                        style={{width:"100%",padding:"11px 13px",border:"1.5px solid var(--gray-light)",borderRadius:"8px",fontFamily:"'Lato',sans-serif",fontSize:"0.95rem"}}

                    />

                </label>

                <label style={{display:"grid",gap:"6px",fontWeight:800,fontSize:"0.78rem",textTransform:"uppercase",color:"var(--text-mid)",marginTop:"12px"}}>

                    Tienda destino

                    <select value={transferToStore} onChange={(e)=>setTransferToStore(e.target.value)} style={{width:"100%",padding:"11px 13px",border:"1.5px solid var(--gray-light)",borderRadius:"8px",fontFamily:"'Lato',sans-serif",fontSize:"0.95rem",background:"#f8fbf9"}}>

                        <option value="">Seleccionar tienda</option>

                        {stores.filter((s)=>s.storeId!==transferFromStore).map((store)=>(

                            <option key={store.storeId} value={store.storeId}>

                                {store.address||store.storeId}

                            </option>

                        ))}

                    </select>

                </label>

            </FormDialog>

        </div>

    )

}