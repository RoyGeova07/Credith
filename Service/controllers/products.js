const { Products } = require('../models/entities/product');
const{Stores}=require('../models/entities/store')
const{Categories}=require('../models/entities/category');
const{Op}=require("sequelize")
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

async function deleteProduct(req, res) {
    const {
       id
    } = req.params;
    const{storeId}=req.query

    try {
        const product = await Products.findByPk(id);

        if(!product)
        {

            return res.status(404).json({message:`Producto [${id}] no existe`})

        }
        const userRole=req.user?.rol||"OWNER"

        //admin debe enviar storeId obligatoriamente
        if(userRole==="ADMIN"&&!storeId)
        {

            return res.status(400).json({message:"El storeId es obligatorio par administradores"})

        }
        //si viene storeId => eliminar unicamente de esa TIENDA 
        if(storeId)
        {

            const inventory=await StoresInventories.findOne({where:{productId:id,storeId}})

            if(!inventory)
            {

                return res.status(404).json({message:"El producto no existe en la tienda indicada"})

            }

            await inventory.destroy()

            return res.status(200).json({message:"Producto eliminado de la tienda correctamente"})

        }

        //solo owner puede archivar globalmente 
        if(userRole!=="OWNER")
        {

            return res.status(403).json({message:"Solo un OWNER puede archivar globalmente"})

        }

        await product.destroy();

        res.status(201).json({message:"Producto archivado existosamente"});

    } catch (err) {
        res.status(500).json({message:err.message})
    }
}

async function recoverProduct(req, res) {
    const {
       id
    } = req.params;

    try {
        const product = await Products.findByPk(id, { paranoid: false });

        if(!product)
        {

            return res.status(404).json({message:`Producto [${id}] no existe`});

        }

        await product.restore();

        res.status(201).json({message:"Producto restaurado existosamente"});
    } catch (err) {
        res.status(500).json({message:err.message})
    }
}

//agregar opcion de traer la cantidad de stock por categoria --NO OLVIDAARRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
/*
Lista productos.
Un producto aparece una sola vez.
Sirve para administrar catalogo.
*/
async function getPagedProducts(req, res) {
    try 
    {

        const limit=parseInt(req.query.limit)||10
        const offset=parseInt(req.query.offset)||0
        const storeId = req.query.storeId||null
        const category=req.query.category||null
        const archived=req.query.archived==="true"

        let whereStmt = {}
        if (storeId !== null) {
            whereStmt = {
                stores: {
                    storeId: storeId
                }
            }
        }

        const categoyInclude={model:Categories,as:"categories",through:{attributes:[]},attributes:["categoryId","name","description"]}

        if(category)
        {

            categoyInclude.where={name:category}

        }
        if(archived)
        {

            whereStmt.deletedAt={[Op.not]:null}

        }

        const products = await Products.findAndCountAll({
            where: whereStmt,
            limit: limit,
            offset: offset,
            distinct:true,
            paranoid:!archived,
            include:[

                categoyInclude,
                {

                    model:StoresInventories,
                    as:"inventories",
                    attributes:["storeId","inStock"],

                    include:[

                        {

                            model:Stores,
                            as:"store",
                            attributes:[

                                "storeId","address"

                            ]

                        }

                    ]

                }
            
            
            
            ],

        });

        res.json({total:products.count,data:products.rows})

    } catch (err) {

        res.status(500).json({message:err.message})

    }
}

async function getProductById(req, res) {
    const {
       id
    } = req.params;

    try {
        const product = await Products.findByPk(id,{

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

module.exports = {
    postProduct,
    updateProduct,
    deleteProduct,
    getPagedProducts,
    recoverProduct,
    getProductById,
}
