export class RegisterFormConfig
{

    static INITIAL_FORM=
    {

        primerNombre:"",
        segundoNombre:"",
        primerApellido:"",
        segundoApellido:"",
        email:"",
        password:"",
        tienda:"",

    }

    static validate(form)
    {

        const errors={}

        if(!form.primerNombre.trim())
        {

            errors.primerNombre="El primer nombre es requerido"

        }

        if(!form.primerApellido.trim())
        {

            errors.primerApellido="El primer apellido es requerido"

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

        if(!form.tienda)
        {

            errors.tienda="Selecciona una tienda"

        }

        return errors

    }

}