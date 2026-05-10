const Sequelize = require('sequelize');
const Model = Sequelize.Model;

class ProductCategory extends Model { }

function initialize(sequelize, _) {
    return ProductCategory.init(
        {
        },
        {
            sequelize: sequelize,
            tableName: 'products_categories',
            schema: 'cd',
            timestamps: false,
            underscored: true
        }
    )
}

module.exports = {
    ProductsCategories: ProductCategory,
    initialize
}
