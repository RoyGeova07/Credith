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

    if (!BuyPrice || SellPrice < 0) {
        return res.status(400).json({message:"El precio del producto es necesario"});
    }

    if (!InStock || InStock < 0) {
        InStock = 0;
    }

    try {
        await Products.create({
            name: Name,
            buyPrice: BuyPrice,
            sellPrice: SellPrice,
            minGainPercentage: MinGainPercentage,
            inStock: InStock
        })

        res.status(201).json({message:"Producto agregado existosamente",token,user})
    } catch (err) {
        res.status(500).json({message:err.message})
    }
}

async function updateProduct(req, res) {
    const {
        ProductId,
        Name,
        BuyPrice,
        SellPrice,
        MinGainPercentage,
        InStock
    } = req.body;

    if (!Name || Name === "") {
        return res.status(400).json({message:"El nombre de producto es necesario"});
    }

    if (!BuyPrice || SellPrice < 0) {
        return res.status(400).json({message:"El precio del producto es necesario"});
    }

    if (!InStock || InStock < 0) {
        InStock = 0;
    }

    try {
        const product = await Products.findByPk(ProductId);

        if (!product) new Error(`Product [${ProductId}] does not exists`)

        await product.update({
            name: Name,
            buyPrice: BuyPrice,
            sellPrice: SellPrice,
            minGainPercentage: MinGainPercentage,
            inStock: InStock
        });

        res.status(201).json({message:"Producto agregado existosamente"});
    } catch (err) {
        res.status(500).json({message:err.message})
    }
}

async function deleteProduct(req, res) {
    const {
        ProductId
    } = req.body;

    try {
        const product = await Products.findByPk(ProductId);

        if (!product) new Error(`Product [${ProductId}] does not exists`)

        await product.update({isActive:false});

        res.status(201).json({message:"Producto agregado existosamente"});
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
        ProductId
    } = req.body;

    try {
        const product = await Products.findByPk(ProductId);

        if (!product) new Error(`Product [${ProductId}] does not exists`)

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
    selectProductById
}
