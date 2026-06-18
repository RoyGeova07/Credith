const{StoresInventories}=require('../models/entities/storeInventory')
const{Products}=require('../models/entities/product')
const{Stores}=require('../models/entities/store')



//Agregar un producto existente a otra tienda.
//=======================EXCESO DE TEORIA MUCHACHO DESPUES VEMOS QUE SE HACE CON ESTA FUNCION //=======================
// async function addProductToStore(req,res) 
// {

//     const{productId,storeId,inStock}=req.body
//     if(!productId)
//     {

//         return res.status(400).json({message:"El id del producto es requerido"})

//     }
//     if(!storeId)
//     {

//         return res.status(400).json({message:"El id de la tienda es requerida"})

//     }
//     const stock=(!inStock||inStock<0)?1:inStock
//     try
//     {

//         const product=await Products.findByPk(productId)
//         if(!product)
//         {

//             return res.status(404).json({message:"Producto no encontrado"})

//         }
//         const store=await Stores.findByPk(storeId)
//         if(!store)
//         {

//             return res.status(404).json({message:"Tienda no encontrada"})

//         }
//         const inventoryExists=await StoresInventories.findOne({where:{productId,storeId}})
//         if(inventoryExists)
//         {

//             return res.status(400).json({message:"Este producto ya existe en esta tienda"})

//         }
//         await StoresInventories.create({productId,storeId,inStock:stock})


//         return res.status(201).json({message:"Producto agregado a la tienda correctamente",inventoryExists})

//     }catch(error){

//         res.status(500).json({message:error.message})

//     }

// }

async function updateStock(req,res)
{
    try
    {
        const{productId,storeId,stock}=req.body

        if(stock =null||stock<0)
        {

            return res.status(400).json({message:"Stock inválido"})

        }

        const inventory=await StoresInventories.findOne({where:{productId,storeId}})

        if(!inventory)
        {

            return res.status(404).json({message:"Inventario no encontrado"})

        }

        inventory.inStock=stock

        await inventory.save()

        return res.status(200).json({message:"Stock actualizado correctamente",stockActual: inventory.inStock})

    }catch(error){

        return res.status(500).json({message:error.message})

    }
}

//obtener inventario completo de una tienda
/*
Lista inventario.
Un producto puede aparecer varias veces.
Sirve para administrar existencias por tienda.
*/
async function getStoreInventory(req,res) 
{

    const{storeId}=req.params
    try{

        const store=await Stores.findByPk(storeId,{include:[{model:Products,as:"products",through:{attributes:["inStock"]}}]})
        if(!store){

            return res.status(404).json({message:"Tienda no encontrada"})

        }

        res.json(store)

    }catch(e){

        res.status(500).json({message:e.message})

    }

}

//obtener stock de un producto especifico
async function getProductStock(req,res) 
{

    const{productId,storeId}=req.params

    try{

        const inventory=await StoresInventories.findOne({where:{productId,storeId}})

        if(!inventory){

            return res.status(404).json({message:"Registro de inventario no encontrado"})

        }

        res.json(inventory)

    }catch(e){

        res.status(500).json({message:e.message})

    }

}


//listar todos los registros de StoresInventories con paginacion
async function getPagedStoresInventories(req,res) 
{

    try{

        const limit=parseInt(req.query.limit)||10
        const offset=parseInt(req.query.offset)||0

        const inventories=await StoresInventories.findAndCountAll({

            limit,offset,
            include:[{

                model:Products,as:"product",
                attributes:[

                    "productId","name","description","sellPrice","imageUrl"

                ]

            },
            {

                model:Stores,as:"store"

            }]

        })

        res.status(200).json({total:inventories.count,data:inventories.rows,})

    }catch(error){

        res.status(500).json({message:error.message})

    }

}

module.exports={/*addProductToStore*/updateStock,getStoreInventory,getProductStock,getPagedStoresInventories}