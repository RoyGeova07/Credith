const { Products } = require('../models/entities/product');
const { ROLE } = require('../helper/roles')
const{Stores}=require('../models/entities/store')
const{Categories}=require('../models/entities/category');
const{Op, where}=require("sequelize")
const{StoresInventories}=require('../models/entities/storeInventory')

//----------------------------AGREGAR STOCK DESPUES------------------------------------------------
async function postProduct(req, res) {
    const {
        name,
        buyPrice,
        sellPrice,
        description,
        minGainPercentage,
        imageUrl,
        categoryId,
        storeId,
        initialStock,
    } = req.body;

    if (!name || name === "") {
        return res.status(400).json({message:"El nombre de producto es necesario"});
    }

    if (!sellPrice || sellPrice < 0) {
        return res.status(400).json({message:"El precio del producto es necesario"});
    }

    if(!categoryId)
    {

        return res.status(400).json({message: "La categoría es necesaria"});

    }
    //stock es necesario
    const stock=(!initialStock||initialStock<0)?1:initialStock

    try 
    {

        const category=await Categories.findByPk(categoryId)
        const store=await Stores.findByPk(storeId)

        if(!category)
        {

            return res.status(404).json({message:'La categoria no existe'})

        }
        if(!store)
        {

            return res.status(404).json({message:'La tienda no existe'})

        }

        const product=await Products.create({
            name: name,
            description: description,
            buyPrice: buyPrice || 0,
            sellPrice: sellPrice,
            minGainPercentage: minGainPercentage,
            imageUrl:imageUrl,
        })

        await product.addCategory(category)

        await StoresInventories.create({

            productId:product.productId,storeId,inStock:initialStock||1

        })

        res.status(201).json({message:"Producto agregado existosamente"})

    } catch (err) {

        res.status(500).json({message:err.message})

    }
}

//AGREGAR STOCK DESPUES
async function updateProduct(req, res) 
{
    const{productId,name,description,buyPrice,sellPrice,minGainPercentage,imageUrl,categoryId,storeId,stock}=req.body;
    const{id}=req.params

    if (!id || id !== productId) {
        return res.status(400).json({message:"El id enviado por la ruta debe encajar con el del producto a modificar"});
    }

    if (!name || name === "") {
        return res.status(400).json({message:"El nombre de producto es necesario"});
    }

    if (sellPrice==null || sellPrice < 0) 
    {

        return res.status(400).json({message:"El precio de venta es invalido"});

    }

    try 
    {

        const product = await Products.findByPk(productId,{paranoid:false,include:[{model:Categories,as:"categories"}]});

        if(!product) 
        {

            return res.status(404).json({message:`Producto [${id}] no existe`});

        }

        //actualizar producto
        await product.update({name,description,buyPrice: buyPrice || 0,sellPrice,minGainPercentage,imageUrl});


        if(categoryId)
        {

            const category=await Categories.findByPk(categoryId)

            if(!category)
            {

                return res.status(404).json({message:"La categoría no existe"});

            }
            await product.setCategories([category])

        }

        //actualizar stock si vienen storeId y stock
        if(storeId&&stock!=null)
        {

            if(stock<0){

                return res.status(400).json({message:"Stock invalido"})

            }
            const inventory=await StoresInventories.findOne({where:{productId,storeId}})
            if(!inventory){

                return res.status(404).json({message:"Inventario no encontrado para la tienda indicada"})

            }
            inventory.inStock=stock

            await inventory.save()

        }

        res.status(200).json({message:"Producto editado exitosamente"})

    } catch (err) {

        res.status(500).json({message:err.message})

    }
}

async function deleteProduct(req,res)
{
    const { id } = req.params
    const { storeId } = req.query

    try
    {
        const product=await Products.findByPk(id)

        if(!product)
        {
            return res.status(404).json({
                message:`Producto [${id}] no existe`
            })
        }

        const userRole=req.user?.role||ROLE.OWNER

        // ADMIN debe enviar storeId
        if(userRole===ROLE.ADMIN && !storeId)
        {
            return res.status(400).json({
                message:"El storeId es obligatorio para administradores"
            })
        }

        // Archivar solamente en una tienda
        if(storeId)
        {
            const inventory=await StoresInventories.findOne({
                where:{
                    productId:id,
                    storeId
                }
            })

            if(!inventory)
            {
                return res.status(404).json({
                    message:"El producto no existe en la tienda indicada"
                })
            }

            inventory.isActive=false

            await inventory.save()

            return res.status(200).json({
                message:"Producto archivado en la tienda correctamente"
            })
        }

        // Solo OWNER puede archivar globalmente
        if(userRole!==ROLE.OWNER)
        {
            return res.status(403).json({
                message:"Solo un OWNER puede archivar globalmente"
            })
        }

        await product.destroy()

        return res.status(200).json({
            message:"Producto archivado globalmente"
        })
    }
    catch(err)
    {
        return res.status(500).json({
            message:err.message
        })
    }
}

async function recoverProduct(req,res)
{
    const { id } = req.params
    const { storeId } = req.query

    try
    {
        // Restaurar únicamente en una tienda
        if(storeId)
        {
            const inventory=await StoresInventories.findOne({
                where:{
                    productId:id,
                    storeId
                }
            })

            if(!inventory)
            {
                return res.status(404).json({
                    message:"Inventario no encontrado"
                })
            }

            inventory.isActive=true

            await inventory.save()

            return res.status(200).json({
                message:"Producto restaurado en la tienda correctamente"
            })
        }

        // Restauración global
        const product=await Products.findByPk(
            id,
            {
                paranoid:false
            }
        )

        if(!product)
        {
            return res.status(404).json({
                message:`Producto [${id}] no existe`
            })
        }

        await product.restore()

        return res.status(200).json({
            message:"Producto restaurado globalmente"
        })
    }
    catch(err)
    {
        return res.status(500).json({
            message:err.message
        })
    }
}


//agregar opcion de traer la cantidad de stock por categoria --NO OLVIDAARRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
/*
Lista productos.
Un producto aparece una sola vez.
Sirve para administrar catalogo.
*/
async function getPagedProducts(req,res)
{
    try
    {
        const limit=parseInt(req.query.limit)||10
        const offset=parseInt(req.query.offset)||0

        const category=req.query.category||null
        const archived=req.query.archived==="true"

        const userRole=req.user?.role
        const userStoreId=req.user?.storeId

        const selectedStoreId=req.query.storeId||null

        let whereStmt={}
        let paranoid=true

        //OWNER + Inventario General + Archivados
        const isGlobalArchivedView=archived&&!selectedStoreId&&userRole===ROLE.OWNER

        if(isGlobalArchivedView)
        {

            whereStmt.deletedAt={[Op.not]:null}
            paranoid=false

        }

        const categoryInclude={

            model:Categories,
            as:"categories",
            through:{attributes:[]},
            attributes:["categoryId","name","description"]

        }

        if(category)
        {

            categoryInclude.where={name:category}

        }

        const inventoryInclude={
            model:StoresInventories,
            as:"inventories",
            attributes:["storeId","inStock"],
            include:[
                {

                    model:Stores,
                    as:"store",
                    attributes:["storeId","address"]

                }
            ]
        }

        /*
        OWNER + Inventario General + Archivados
        */
        if(!isGlobalArchivedView)
        {

            inventoryInclude.where={isActive:!archived}

        }

        //ADMIN y EMPLOYEE solo ven su tienda
        if(userRole===ROLE.ADMIN||userRole===ROLE.EMPLOYEE)
        {

            inventoryInclude.where={...(inventoryInclude.where||{}),storeId:userStoreId}

            inventoryInclude.required=true

        //OWNER seleccionó una tienda específica
        }else if(selectedStoreId){

            inventoryInclude.where={...(inventoryInclude.where||{}),storeId:selectedStoreId}

            inventoryInclude.required=true

        }

        const products=await Products.findAndCountAll({

            where:whereStmt,
            limit,
            offset,
            distinct:true,
            paranoid,
            include:[categoryInclude,inventoryInclude]

        })

        return res.status(200).json({total:products.count,data:products.rows})

    }catch(err){

        return res.status(500).json({message:err.message})

    }
}

async function getProductById(req, res) 
{
    const {id}=req.params;

    try 
    {
        const product=await Products.findByPk(id,{

            include:[

                {

                    model:Categories,
                    as:"categories",
                    through:{attributes:[]}

                }

            ]

        });

        if(!product) 
        {

            return res.status(404).json({message: `Producto [${id}] no existe`});

        }

        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({message:err.message})
    }
}

module.exports={
    postProduct,
    updateProduct,
    deleteProduct,
    getPagedProducts,
    recoverProduct,
    getProductById,
}
