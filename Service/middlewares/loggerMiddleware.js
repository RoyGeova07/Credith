/**
 * 
 * este archivo registrara peticiones 
 * detectara errores 
 * ayuda a depurar
 * ver q rutas se estan depurando
 * medir tiempos de respuesta
 * 
 */

const LoggerMiddleware=(req,res,next)=>
{

    const inicio=Date.now()

    //ignorar archivos de swagger
    const ignoredRoutes=
    [ 

        '/api-docs/swagger-ui.css',
        '/api-docs/swagger-ui-bundle.js',
        '/api-docs/swagger-ui-standalone-preset.js',
        '/api-docs/swagger-ui-init.js',
        '/api-docs/favicon-32x32.png'

    ]
    if(ignoredRoutes.includes(req.originalUrl))
    {

        return next()

    }

    
    console.log('\n========================================')
    console.log(`📌 ${req.method} ${req.originalUrl}`)
    console.log(`🕒 ${new Date().toLocaleString()}`)

    res.on('finish',()=>
    {

        const duracion=Date.now()-inicio
        let statusEmoji='✅'
        if(res.statusCode>=400)
        {

            statusEmoji='❌'

        }
        console.log(`${statusEmoji} Status: ${res.statusCode}`)
        console.log(`⚡ Tiempo: ${duracion}ms`)
        console.log('========================================')

    })
    next()

}

module.exports=LoggerMiddleware