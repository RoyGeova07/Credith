'use strict'

const now = new Date()

const categoryIds = {
  electrodomesticos: '2c0fbb80-7f25-4d98-9458-4200f18aa100',
  electronica: '2c0fbb80-7f25-4d98-9458-4200f18aa101',
  smartHome: '2c0fbb80-7f25-4d98-9458-4200f18aa102',
  tecnologia: '2c0fbb80-7f25-4d98-9458-4200f18aa103',
  deportes: '2c0fbb80-7f25-4d98-9458-4200f18aa104',
  cocina: '2c0fbb80-7f25-4d98-9458-4200f18aa105',
}

const productIds = {
  refrigeradora: '6db92031-9a7a-4680-8a4f-2b6af4db2100',
  smartTv: '6db92031-9a7a-4680-8a4f-2b6af4db2101',
  robot: '6db92031-9a7a-4680-8a4f-2b6af4db2102',
  laptop: '6db92031-9a7a-4680-8a4f-2b6af4db2103',
  bicicleta: '6db92031-9a7a-4680-8a4f-2b6af4db2104',
  freidora: '6db92031-9a7a-4680-8a4f-2b6af4db2105',
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      { schema: 'cd', tableName: 'categories' },
      [
        {
          category_id: categoryIds.electrodomesticos,
          name: 'electrodomésticos',
          description: 'Refrigeradoras, lavadoras, hornos y pequeños aparatos para el hogar.',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          category_id: categoryIds.electronica,
          name: 'electrónica',
          description: 'Pantallas, audio, entretenimiento y dispositivos de consumo.',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          category_id: categoryIds.smartHome,
          name: 'smart home',
          description: 'Tecnología para automatizar, proteger y conectar el hogar.',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          category_id: categoryIds.tecnologia,
          name: 'tecnología',
          description: 'Laptops, accesorios y equipos para productividad y estudio.',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          category_id: categoryIds.deportes,
          name: 'deportes',
          description: 'Artículos para entrenamiento, bienestar y vida activa.',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          category_id: categoryIds.cocina,
          name: 'cocina',
          description: 'Equipos y utensilios pensados para agilizar la preparación diaria.',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
      ],
      {}
    )

    await queryInterface.bulkInsert(
      { schema: 'cd', tableName: 'products' },
      [
        {
          product_id: productIds.refrigeradora,
          name: 'Refrigeradora Inverter 18 pies',
          image_url: 'https://picsum.photos/seed/refrigeradora-preview/560/420',
          description: 'Ahorro energético, distribución uniforme del frío y diseño premium.',
          buy_price: 18500,
          sell_price: 24999,
          min_gain_percentage: 18,
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          product_id: productIds.smartTv,
          name: 'Smart TV 55 pulgadas 4K',
          image_url: 'https://picsum.photos/seed/smarttv-preview/560/420',
          description: 'Pantalla brillante, apps integradas y excelente experiencia de cine en casa.',
          buy_price: 11800,
          sell_price: 15999,
          min_gain_percentage: 20,
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          product_id: productIds.robot,
          name: 'Aspiradora robot inteligente',
          image_url: 'https://picsum.photos/seed/robot-preview/560/420',
          description: 'Limpieza programable con sensores de mapeo y control desde app.',
          buy_price: 6300,
          sell_price: 8999,
          min_gain_percentage: 22,
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          product_id: productIds.laptop,
          name: 'Laptop 15 pulgadas Ryzen',
          image_url: 'https://picsum.photos/seed/laptop-preview/560/420',
          description: 'Rendimiento equilibrado para trabajo remoto, universidad y oficina.',
          buy_price: 14400,
          sell_price: 18999,
          min_gain_percentage: 18,
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          product_id: productIds.bicicleta,
          name: 'Bicicleta estática compacta',
          image_url: 'https://picsum.photos/seed/bike-preview/560/420',
          description: 'Entrenamiento en casa con estructura estable y resistencia ajustable.',
          buy_price: 4700,
          sell_price: 6499,
          min_gain_percentage: 16,
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          product_id: productIds.freidora,
          name: 'Freidora de aire familiar',
          image_url: 'https://picsum.photos/seed/freidora-preview/560/420',
          description: 'Preparaciones rápidas con menos aceite y controles sencillos.',
          buy_price: 2200,
          sell_price: 3299,
          min_gain_percentage: 17,
          is_active: true,
          created_at: now,
          updated_at: now,
        },
      ],
      {}
    )

    await queryInterface.bulkInsert(
      { schema: 'cd', tableName: 'products_categories' },
      [
        { product_id: productIds.refrigeradora, category_id: categoryIds.electrodomesticos },
        { product_id: productIds.smartTv, category_id: categoryIds.electronica },
        { product_id: productIds.robot, category_id: categoryIds.smartHome },
        { product_id: productIds.laptop, category_id: categoryIds.tecnologia },
        { product_id: productIds.bicicleta, category_id: categoryIds.deportes },
        { product_id: productIds.freidora, category_id: categoryIds.cocina },
      ],
      {}
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      { schema: 'cd', tableName: 'products_categories' },
      {
        product_id: {
          [Sequelize.Op.in]: Object.values(productIds),
        },
      },
      {}
    )

    await queryInterface.bulkDelete(
      { schema: 'cd', tableName: 'products' },
      {
        product_id: {
          [Sequelize.Op.in]: Object.values(productIds),
        },
      },
      {}
    )

    await queryInterface.bulkDelete(
      { schema: 'cd', tableName: 'categories' },
      {
        category_id: {
          [Sequelize.Op.in]: Object.values(categoryIds),
        },
      },
      {}
    )
  },
}
