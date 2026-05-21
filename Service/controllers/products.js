const { Products } = require('../models/entities/product');

async function postProduct(req, res) {
    const {
        name,
        buyPrice,
        sellPrice,
        description,
        minGainPercentage,
        inStock,
        stores,
    } = req.body;

    if (!name || name === "") {
        return res.status(400).json({message:"El nombre de producto es necesario"});
    }

    if (!sellPrice || sellPrice < 0) {
        return res.status(400).json({message:"El precio del producto es necesario"});
    }

    let stock = inStock;
    if (!inStock || inStock < 0) {
        stock = 1;
    }

    try {
        await Products.create({
            name: name,
            description: description,
            buyPrice: buyPrice || 0,
            sellPrice: sellPrice,
            minGainPercentage: minGainPercentage,
            inStock: stock,
            stores: stores
        })

        res.status(201).json({message:"Producto agregado existosamente"})
    } catch (err) {
        res.status(500).json({message:err.message})
    }
}

async function updateProduct(req, res) {
    const {
        id,
        productId,
        name,
        buyPrice,
        sellPrice,
        minGainPercentage,
        inStock
    } = req.body;

    if (!id || id !== productId) {
        return res.status(500).json({message:"El id enviado por la ruta debe encajar con el del producto a modificar"});
    }

    if (!name || name === "") {
        return res.status(400).json({message:"El nombre de producto es necesario"});
    }

    if (!buyPrice || sellPrice < 0) {
        return res.status(400).json({message:"El precio del producto es necesario"});
    }

    let stock = inStock;
    if (!inStock || inStock < 0) {
        stock = 0;
    }

    try {
        const product = await Products.findByPk(productId);

        if (!product) new Error(`Producto [${productId}] no existe`)

        await product.update({
            name: name,
            buyPrice: buyPrice,
            sellPrice: sellPrice,
            minGainPercentage: minGainPercentage,
            inStock: inStock
        });

        res.status(201).json({message:"Producto editado existosamente"});
    } catch (err) {
        res.status(500).json({message:err.message})
    }
}

async function deleteProduct(req, res) {
    const {
       id
    } = req.params;

    try {
        const product = await Products.findByPk(id);

        if (!product) new Error(`Producto [${id}] no existe`)

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

        if (!product) new Error(`Producto [${id}] no existe`)

        await product.restore();

        res.status(201).json({message:"Producto restaurado existosamente"});
    } catch (err) {
        res.status(500).json({message:err.message})
    }
}

async function getProduct(req, res) {
    try {
        const limit=parseInt(req.query.limit)||10
        const offset=parseInt(req.query.offset)||0
        const storeId = req.query.storeId||null;

        let whereStmt = {}
        if (storeId !== null) {
            whereStmt = {
                stores: {
                    storeId: storeId
                }
            }
        }

        const products = await Products.findAndCountAll({
            where: whereStmt,
            limit: limit,
            offset: offset
        });
        res.json({total:products.count,products:products.rows})
    } catch (err) {
        res.status(500).json({message:err.message})
    }
}

async function getProductById(req, res) {
    const {
       id
    } = req.params;

    try {
        const product = await Products.findByPk(id);

        if (!product) new Error(`Producto [${id}] no existe`)

        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({message:err.message})
    }
}

module.exports = {
    postProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    recoverProduct,
    getProductById
}
