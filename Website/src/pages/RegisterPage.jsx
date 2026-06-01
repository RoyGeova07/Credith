import { useState,useEffect } from "react";
import "./RegisterPage.css";
import DualPanel from "@/components/DualPanel";
import FormGrid from "@/components/form/FormGrid";
import FormField from "@/components/form/FormField";
import BrandPanel from "@/components/BrandPanel"; 
import{RegisterFormConfig}from '@/pages/constants/registerForm'
import{Get}from '@/helpers/fetcher'


export default function RegisterPage() 
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

            const newErrors = RegisterFormConfig.validate(updated)
            setErrors((prev) => ({ ...prev, [e.target.name]: newErrors[e.target.name] }));

        }
    };

    const handleBlur = (e) => 
    {

        setTouched((prev) => ({ ...prev, [e.target.name]: true }));
        const newErrors = RegisterFormConfig.validate(form)
        setErrors((prev) => ({ ...prev, [e.target.name]: newErrors[e.target.name] }));

    };

    const handleSubmit = (e) => 
    {

        e.preventDefault();
        const allTouched = Object.keys(RegisterFormConfig.validate(form)).reduce(
        (acc, k) => ({ ...acc, [k]: true }), {}
        );
        setTouched(allTouched);
        const newErrors = RegisterFormConfig.validate(form)
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setLoading(true);
        setTimeout(() => 
        {

            setLoading(false);
            setSuccess(true);
            setForm(RegisterFormConfig.INITIAL_FORM);
            setErrors({});
            setTouched({});
            setTimeout(() => setSuccess(false), 4000);

        }, 1200);

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

                setStores(respuesta.json.stores)

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

                            inputName="primerNombre"
                            description="Primer Nombre"
                            placeholder="Ej. Juan"
                            value={form.primerNombre}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.primerNombre}
                            touched={touched.primerNombre}
                            required

                        />

                        <FormField

                            inputName="segundoNombre"
                            description="Segundo Nombre"
                            placeholder="Ej. Carlos"
                            value={form.segundoNombre}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.segundoNombre}
                            touched={touched.segundoNombre}

                        />

                        <FormField

                            inputName="primerApellido"
                            description="Primer Apellido"
                            placeholder="Ej. García"
                            value={form.primerApellido}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.primerApellido}
                            touched={touched.primerApellido}
                            required

                        />

                        <FormField

                            inputName="segundoApellido"
                            description="Segundo Apellido"
                            placeholder="Ej. López"
                            value={form.segundoApellido}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.segundoApellido}
                            touched={touched.segundoApellido}

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

                            <label htmlFor="tienda">

                                Tienda <span className="required">*</span>

                                </label>

                            <div className={`select-wrapper ${touched.tienda? errors.tienda ? "input-error" : "input-ok": ""}`}>

                                <select

                                    id="tienda"
                                    name="tienda"
                                    value={form.tienda}
                                    onChange={handleChange}
                                    onBlur={handleBlur}

                                >

                                    <option value="" disabled>Selecciona tu tienda</option>

                                    {stores.map((store)=>(

                                        <option 

                                            key={store.storeId}
                                            value={store.storeId}

                                        >

                                            {`${store.company.name} - ${store.address}`}
                                           
                                        </option>
                                    ))}
                                            

                                </select>

                            </div>

                            {touched.tienda && errors.tienda&&(<span className="error-msg">⚠ {errors.tienda}</span>)}

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
                    <a href="/login">Inicia sesión</a>
                    
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