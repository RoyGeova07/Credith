
require('dotenv').config()
const{DB_HOST,DB_PORT,DB_NAME,DB_USER,DB_PASSWORD,DB_DIALECT,DB_HOST_D}=process.env

module.exports={
  development: {
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_DIALECT
    // logging:false
  },
  docker: {
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST_D,
    port: DB_PORT,
    dialect: DB_DIALECT
  }
}
