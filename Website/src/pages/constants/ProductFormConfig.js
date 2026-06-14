export class ProductFormConfig
{

    static INITIAL_FORM=
    {
 
        name:"",
        imageUrl:"",
        description:"",
        buyPrice:"",
        sellPrice:"",
        minGainPercentage:"",
        categories:[],
 
    }

    static validateProduct(form)
    {

        const errors=[]
        if(!form.name.trim())
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

        if(form.minGainPercentage!==""&&(isNaN(form.minGainPercentage)||Number(form.minGainPercentage)<0||Number(form.minGainPercentage)>100))
        {

            errors.minGainPercentage="Ingrese un porcentaje valido entre 0 y 100"

        }

        return errors



    }

}