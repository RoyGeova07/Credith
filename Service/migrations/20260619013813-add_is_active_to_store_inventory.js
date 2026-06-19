'use strict'

module.exports = {
    async up(queryInterface, Sequelize)
    {
        await queryInterface.addColumn(
            { schema:'cd', tableName:'stores_inventories' },
            'is_active',
            {
                type: Sequelize.BOOLEAN,
                allowNull:false,
                defaultValue:true
            }
        )
    },

    async down(queryInterface)
    {
        await queryInterface.removeColumn(
            { schema:'cd', tableName:'stores_inventories' },
            'is_active'
        )
    }
}