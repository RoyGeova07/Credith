const swaggerDoc=require('swagger-jsdoc')

const options=
{

    definition:
    {

        openapi:'3.0.0',
        info:
        {

            title:'APIs ServiCredith',
            version:'1.0.0',
            description:'Documentacion APIs'

        },
        servers:
        [

            {

                url:'http://localhost:3000'

            }

        ]

    },
    apis:[`${__dirname}/../routes/*.js`]

}
const spescs=swaggerDoc(options)

module.exports=spescs