import { useState,useEffect } from "react";
import "./RegisterPage.css";
import DualPanel from "@/components/DualPanel";
import FormGrid from "@/components/form/FormGrid";
import FormField from "@/components/form/FormField";
import BrandPanel from "@/components/BrandPanel";
import{RegisterFormConfig}from '@/pages/constants/FormConfig'
import{Get,Post}from '@/helpers/fetcher'
import { toast } from 'react-toastify'


export default function RegisterPage({ onRegister, onLogin })
{

    const [form, setForm] = useState(RegisterFormConfig.INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const[stores,setStores]=useState([])

    const handleChange = (e) => 
    {
        const updated = { ...form, [e.target.name]: e.target.value };
        setForm(updated);
        if (touched[e.target.name]) 
        {

            const newErrors = RegisterFormConfig.validateRegister(updated)
            setErrors((prev) => ({ ...prev, [e.target.name]: newErrors[e.target.name] }));

        }
    };

    const handleBlur = (e) => 
    {

        setTouched((prev) => ({ ...prev, [e.target.name]: true }));
        const newErrors = RegisterFormConfig.validateRegister(form)
        setErrors((prev) => ({ ...prev, [e.target.name]: newErrors[e.target.name] }));

    };

    const handleSubmit =async(e)=> 
    {

        e.preventDefault();
        const allTouched = Object.keys(RegisterFormConfig.validateRegister(form)).reduce(
        (acc, k) => ({ ...acc, [k]: true }), {}
        );
        setTouched(allTouched);
        const newErrors = RegisterFormConfig.validateRegister(form)
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setLoading(true);
        try
        {

            const response=await Post('/api/users',JSON.stringify(form));

            if(response.status!==201)
            {

                throw new Error(response.json.message||'Error al registrar usuario');

            }

            setSuccess(true);

            onRegister();

        }catch(error){

            console.error(error);

            toast.error(error.message);

        }finally{

            setLoading(false);

        }

    };

    useEffect(()=>
    {

        const cargarStores=async()=>
        {

            try
            {

                const respuesta=await Get('/api/stores')

                if(respuesta.status!==200)
                {

                    throw new Error("Error obteniendo las tiendas: "+respuesta.statusText)

                }

                console.log(respuesta.json.data)
                setStores(respuesta.json.data)

            }catch(error){

                console.error('Error obteniendo las tiendas: ',error)

            }


        }
        cargarStores()

       
    },[])

    const formPanel=
    (
        <div className="form-panel">

            <div className="card">

                {success&&
                (
                    
                    <div className="success-banner">

                        <span className="success-icon">✓</span>

                        <div>

                            <strong>¡Registro exitoso!</strong>
                            <p>Tu cuenta ha sido creada correctamente.</p>

                        </div>

                    </div>

                )}

                <h2 className="card-title">Crear Cuenta</h2>
                <p className="card-subtitle">

                    Completa el formulario para registrarte en ServiCredith

                </p>

                <form onSubmit={handleSubmit} noValidate>

                    <FormGrid>

                        <FormField

                            inputName="first_name"
                            description="Primer Nombre"
                            placeholder="Ej. Juan"
                            value={form.first_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.first_name}
                            touched={touched.first_name}
                            required

                        />

                        <FormField

                            inputName="second_name"
                            description="Segundo Nombre"
                            placeholder="Ej. Carlos"
                            value={form.second_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.second_name}
                            touched={touched.second_name}

                        />

                        <FormField

                            inputName="first_last_name"
                            description="Primer Apellido"
                            placeholder="Ej. García"
                            value={form.first_last_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.first_last_name}
                            touched={touched.first_last_name}
                            required

                        />

                        <FormField

                            inputName="second_last_name"
                            description="Segundo Apellido"
                            placeholder="Ej. López"
                            value={form.second_last_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.second_last_name}
                            touched={touched.second_last_name}

                        />

                        <FormField

                            inputName="email"
                            description="Correo Electrónico"
                            placeholder="correo@ejemplo.com"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.email}
                            touched={touched.email}
                            required
                            className="full"

                        />

                        {/* Password con barra de fortaleza — necesita JSX extra, no entra en FormField generico */}
                        <div className="field-group full">

                            <label htmlFor="password">

                                Contraseña <span className="required">*</span>

                            </label>

                            <div className="password-wrapper">
                                
                                <input

                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={form.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={touched.password? errors.password ?"input-error":"input-ok":""}

                                />

                                {form.password.length>0&&
                                (
                                    <div className="strength-bar">

                                        <div

                                            className={`strength-fill strength-${form.password.length<6?"weak":form.password.length<10?"medium":"strong"}`}

                                            style={{width:`${Math.min((form.password.length/12)*100,100)}%`,}}

                                        />

                                    </div>
                                )}

                            </div>
                            {touched.password&&errors.password&&
                            (

                                <span className="error-msg">⚠ {errors.password}</span>

                            )}
                            {!errors.password&&form.password.length>0&&
                            (

                                <span className={`strength-label strength-label-${form.password.length <6 ?"weak":form.password.length < 10 ? "medium" : "strong"}`}>

                                    {form.password.length < 6?"Contraseña débil" :form.password.length <10 ?"Contraseña aceptable":"Contraseña fuerte ✓"}

                                </span>

                            )}

                        </div>

                        {/* Tienda — select, no input; igual necesita JSX propio */}
                        <div className="field-group full">

                            <label htmlFor="storeId">

                                Tienda <span className="required">*</span>

                                </label>

                            <div className={`select-wrapper ${touched.storeId? errors.storeId ? "input-error" : "input-ok": ""}`}>

                                <select

                                    id="storeId"
                                    name="storeId"
                                    value={form.storeId}
                                    onChange={handleChange}
                                    onBlur={handleBlur}

                                >

                                    <option value="" disabled>Selecciona tu tienda</option>

                                   {stores.filter(store => store.company).map(store => 
                                    (

                                        <option

                                            key={store.storeId}
                                            value={store.storeId}

                                        >

                                            {`${store.company.name} - ${store.address}`}

                                        </option>

                                    ))}
                                            

                                </select>

                            </div>

                            {touched.storeId && errors.storeId&&(<span className="error-msg">⚠ {errors.storeId}</span>)}

                        </div>

                    </FormGrid>

                    <button

                        type="submit"
                        className={`btn-register ${loading ? "btn-loading" : ""}`}
                        disabled={loading}

                    >

                        {loading ? <span className="spinner"/>:"Registrarse"}

                    </button>

                </form>

                <p className="login-prompt">

                    ¿Ya tienes una cuenta?
                    <button type="button" className="link-btn" onClick={onLogin}>Inicia sesión</button>

                </p>

            </div>

        </div>
    );

    return(

        <DualPanel

            left={<BrandPanel />}
            right={formPanel}

        />

    );
}