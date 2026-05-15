const { Products } = require('../models/entities/product')

async function createProduct(req, res) {
    const {
        Name,
        BuyPrice,
        SellPrice,
        MinGainPercentage,
        InStock
    } = req.body;

    if (!Name || Name === "") {
        return res.status(400).json({message:"El nombre de producto es necesario"});
    }

    if (!SellPrice || SellPrice < 0) {
        return res.status(400).json({message:"El precio del producto es necesario"});
    }

    let stock = InStock;
    if (!InStock || InStock < 0) {
        stock = 1;
    }

    try {
        await Products.create({
            name: Name,
            buyPrice: BuyPrice || 0,
            sellPrice: SellPrice,
            minGainPercentage: MinGainPercentage,
            inStock: stock 
        })

        res.status(201).json({message:"Producto agregado existosamente"})
    } catch (err) {
        res.status(500).json({message:err.message})
    }
}

async function updateProduct(req, res) {
    const {
        id,
        ProductId,
        Name,
        BuyPrice,
        SellPrice,
        MinGainPercentage,
        InStock
    } = req.body;

    if (!id || id !== ProductId) {
        return res.status(500).json({message:"El id enviado por la ruta debe encajar con el del producto a modificar"});
    }

    if (!Name || Name === "") {
        return res.status(400).json({message:"El nombre de producto es necesario"});
    }

    if (!BuyPrice || SellPrice < 0) {
        return res.status(400).json({message:"El precio del producto es necesario"});
    }

    let stock = InStock;
    if (!InStock || InStock < 0) {
        stock = 0;
    }

    try {
        const product = await Products.findByPk(ProductId);

        if (!product) new Error(`Producto [${ProductId}] no existe`)

        await product.update({
            name: Name,
            buyPrice: BuyPrice,
            sellPrice: SellPrice,
            minGainPercentage: MinGainPercentage,
            inStock: InStock
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

async function selectProduct(req, res) {
    try {
        const limit=parseInt(req.query.limit)||10
        const offset=parseInt(req.query.offset)||0

        const products = await Products.findAndCountAll({limit,offset})
        res.json({total:products.count,products:products.rows})
    } catch (err) {
        res.status(500).json({message:err.message})
    }
}

async function selectProductById(req, res) {
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
    createProduct,
    updateProduct,
    deleteProduct,
    selectProduct,
    recoverProduct,
    selectProductById
}
