export class ProductFormConfig
{

    static INITIAL_FORM=
    {
 
        name:"",
        imageUrl:"",
        description:"",
        buyPrice:"",
        sellPrice:"",
        categories:[],
        storeId:"",
        storeName:"",
        initialStock:"",
 
    }

    static validateProduct(form)
    {

        const errors={}
        if(!form.name?.trim())
        {

            errors.name="El nombre del producto es requerido"

        }
        if(!form.buyPrice)
        {

            errors.buyPrice="El precio de compra es requerido"

        }else if(isNaN(form.buyPrice)||Number(form.buyPrice)<0){

            errors.buyPrice="Ingresa un precio de compra valido"

        }

        if(!form.sellPrice)
        {

            errors.sellPrice="El precio de venta es requerido"

        }else if(isNaN(form.sellPrice)||Number(form.sellPrice)<0){

            errors.sellPrice="Ingrese un precio de venta valio"

        }else if(Number(form.sellPrice)<Number(form.buyPrice)){

            errors.sellPrice="El precio de venta no puede ser menor al de compra"

        }

        if(!form.categories||form.categories.length===0)
        {

            errors.categories="La categoria es necesaria"

        }
        if(!form.storeId){

            errors.storeId="La tienda es requerida"

        }
        if(form.initialStock&&Number(form.initialStock)<1){

            errors.initialStock="El stock debe ser mayor a cero"

        }

        return errors



    }

}