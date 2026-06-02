export class RegisterFormConfig
{

    static INITIAL_FORM=
    {

        first_name:"",
        second_name:"",
        first_last_name:"",
        second_last_name:"",
        email:"",
        password:"",
        storeId:"",

    }

    static validateRegister(form)
    {

        const errors={}

        if(!form.first_name.trim())
        {

            errors.first_name="El primer nombre es requerido"

        }

        if(!form.first_last_name.trim())
        {

            errors.first_last_name="El primer apellido es requerido"

        }

        if(!form.email.trim())
        {

            errors.email="El correo electronico es requerido"

        }else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)){

            errors.email="Ingresa un correo valido"

        }

        if(!form.password)
        {

            errors.password="La contraseña es requerida"

        }else if(form.password.length<6){

            errors.password="La contraseña debe tener al menos 6 caracteres.";

        }

        if(!form.storeId)
        {

            errors.storeId="Selecciona una tienda"

        }

        return errors

    }




}

export class LoginFormConfig
{

    static INITIAL_LOG=
    {

        email:"",
        password:"",

    }


    static validateLogin(form)
    {

        const errors={}

        if (!form.email.trim()) 
        {

            errors.email='El correo es requerido'

        }

        if(!form.password.trim()) 
        {
            
            errors.password='La contraseña es requerida'

        }

        return errors

    }

}