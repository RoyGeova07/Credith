const { Op } = require('sequelize')
const{StoresInventories}=require('../models/entities/storeInventory')
const{Products}=require('../models/entities/product')
const{Stores}=require('../models/entities/store')
const{Users}=require('../models/entities/user')
const { ROLE } = require('../helper/roles')



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

        if(stock ===null||stock===undefined||stock<0)
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

async function  getMyStoreInventory(req,res)
{
 
    try
    {

        const storeId=req.user.storeId
        if(!storeId){

            return res.status(400).json({message:"El usuario no tiene tienda asignada"})

        }
        const inventories=await StoresInventories.findAndCountAll({

            include:[

                {

                    model:Products,as:"product",attributes:[ "productId","name","description","sellPrice","buyPrice","imageUrl","minGainPercentage"],

                }

            ],where:{storeId}

        })
        return res.status(200).json({total:inventories.count,data:inventories.rows})


    }catch(error){

        return res.status(500).json({message:error.message})

    }

}

async function getLowStockInventory(req, res) {
    try {
        const threshold = Math.max(0, parseInt(req.query.threshold) || 5)

        if (req.user.role === ROLE.ADMIN) {
            const storeId = req.user.storeId
            if (!storeId) return res.status(400).json({ message: 'El usuario no tiene tienda asignada' })

            const items = await StoresInventories.findAll({
                where: { storeId, inStock: { [Op.lte]: threshold } },
                include: [{ model: Products, as: 'product', attributes: ['productId', 'name'] }]
            })
            return res.status(200).json({ data: items })
        }

        // OWNER: all stores of their company
        const user = await Users.findByPk(req.user.id, {
            include: [{ model: Stores, as: 'store', attributes: ['companyId'] }]
        })
        const companyId = user?.store?.companyId

        if (!companyId) return res.status(200).json({ data: [] })

        const items = await StoresInventories.findAll({
            where: { inStock: { [Op.lte]: threshold } },
            include: [
                { model: Products, as: 'product', attributes: ['productId', 'name'] },
                {
                    model: Stores, as: 'store',
                    attributes: ['storeId', 'address'],
                    where: { companyId },
                    required: true
                }
            ]
        })
        return res.status(200).json({ data: items })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

async function transferStock(req,res)
{
    try
    {
        const{productId,fromStoreId,toStoreId,quantity}=req.body

        if(!productId||!fromStoreId||!toStoreId||!quantity||quantity<1)
        {

            return res.status(400).json({message:"Datos inválidos para la transferencia"})

        }

        if(fromStoreId===toStoreId)
        {

            return res.status(400).json({message:"Las tiendas deben ser diferentes"})

        }

        const fromInventory=await StoresInventories.findOne({where:{productId,storeId:fromStoreId}})

        if(!fromInventory)
        {

            return res.status(404).json({message:"Inventario de origen no encontrado"})

        }

        if(fromInventory.inStock<quantity)
        {

            return res.status(400).json({message:`Stock insuficiente en origen. Disponible: ${fromInventory.inStock}`})

        }

        fromInventory.inStock-=quantity
        await fromInventory.save()

        const toInventory=await StoresInventories.findOne({where:{productId,storeId:toStoreId}})

        if(toInventory)
        {

            toInventory.inStock+=quantity
            await toInventory.save()

        }else{

            await StoresInventories.create({productId,storeId:toStoreId,inStock:quantity})

        }

        return res.status(200).json({message:"Transferencia exitosa"})

    }catch(error){

        return res.status(500).json({message:error.message})

    }
}

module.exports={/*addProductToStore*/updateStock,getStoreInventory,getProductStock,getPagedStoresInventories, getMyStoreInventory, getLowStockInventory,transferStock}