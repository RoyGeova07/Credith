'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports=
{

  async up(queryInterface, Sequelize) 
  {
    
    //eliminar columna vieja
    await queryInterface.removeColumn({tableName:'users',schema:'cd'},'name')

    //nuevas columnas 
    await queryInterface.addColumn({tableName:'users',schema:'cd'},'first_name',{type:Sequelize.STRING(100),allowNull:false,defaultValue:''})

    await queryInterface.addColumn({tableName:'users',schema:'cd'},'second_name',{type:Sequelize.STRING(100),allowNull:false,defaultValue:''})

    await queryInterface.addColumn({tableName:'users',schema:'cd'},'first_last_name',{type:Sequelize.STRING(100),allowNull:false,defaultValue:''})

    await queryInterface.addColumn({tableName:'users',schema:'cd'},'second_last_name',{type:Sequelize.STRING(100),allowNull:false,defaultValue:''})

    //timestamps
    await queryInterface.addColumn({tableName:'users',schema:'cd'},'created_at',{type:Sequelize.DATE,allowNull:false,defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')})

    await queryInterface.addColumn({tableName:'users',schema:'cd'},'updated_at',{type:Sequelize.DATE,allowNull:false,defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')})

  },

  async down (queryInterface, Sequelize)
  {

    //restaturar columna vieja
    await queryInterface.addColumn({tableName:'users',schema:'cd'},'name',{type:Sequelize.STRING(100),allowNull:false,defaultValue:''})

    //eliminar nuevas columnas
    await queryInterface.removeColumn({tableName:'users',schema:'cd'},'first_name')

    await queryInterface.removeColumn({tableName:'users',schema:'cd'},'second_name')

    await queryInterface.removeColumn({tableName:'users',schema:'cd'},'first_last_name')

    await queryInterface.removeColumn({tableName:'users',schema:'cd'},'second_last_name')

    //timestamps
    await queryInterface.removeColumn({tableName:'users',schema:'cd'},'created_at')

    await queryInterface.removeColumn({tableName:'users',schema:'cd'},'updated_at')

   
  }

};
