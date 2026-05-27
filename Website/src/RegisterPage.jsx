import { useState } from "react";
import "./RegisterPage.css";

const stores = ["ServiCredith Central", "ServiCredith Norte", "ServiCredith Sur", "ServiCredith Oriente", "ServiCredith Occidente", "ServiCredith San Pedro", "ServiCredith Tegucigalpa", "ServiCredith La Ceiba", "ServiCredith Choloma",];

const INITIAL_FORM =
{

    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    email: "",
    password: "",
    tienda: "",

};

function validate(form) {

    const errors = {};
    if (!form.primerNombre.trim()) errors.primerNombre = "El primer nombre es requerido.";
    if (!form.primerApellido.trim()) errors.primerApellido = "El primer apellido es requerido.";
    if (!form.email.trim()) {
        errors.email = "El correo electrónico es requerido.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = "Ingresa un correo válido.";
    }
    if (!form.password) {
        errors.password = "La contraseña es requerida.";
    } else if (form.password.length < 6) {
        errors.password = "La contraseña debe tener al menos 6 caracteres.";
    }
    if (!form.tienda) errors.tienda = "Selecciona una tienda.";
    return errors;
}

export default function RegisterPage() {
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        const updated = { ...form, [e.target.name]: e.target.value };
        setForm(updated);
        // re-validate solo el campo tocado
        if (touched[e.target.name]) {

            const newErrors = validate(updated);
            setErrors((prev) => ({ ...prev, [e.target.name]: newErrors[e.target.name] }));

        }

    };

    const handleBlur = (e) => {
        setTouched((prev) => ({ ...prev, [e.target.name]: true }));
        const newErrors = validate(form);
        setErrors((prev) => ({ ...prev, [e.target.name]: newErrors[e.target.name] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Marcar todos como tocados
        const allTouched = Object.keys(INITIAL_FORM).reduce((acc, k) => ({ ...acc, [k]: true }), {});
        setTouched(allTouched);
        const newErrors = validate(form);
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        // Simular registro
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setForm(INITIAL_FORM);
            setErrors({});
            setTouched({});
            setTimeout(() => setSuccess(false), 4000);
        }, 1200);
    };

    const fieldClass = (name) => {
        if (!touched[name]) return "";
        return errors[name] ? "input-error" : "input-ok";
    };

    return(

        <div className="page-wrapper">

            {/* LEFT BRAND PANEL */}
            <div className="brand-panel">

                <div className="brand-logo-area">
                    
                    <div className="brand-inversiones">Inversiones</div>

                    <div className="brand-house-icon">

                        <svg viewBox="0 0 96 90" fill="none" xmlns="http://www.w3.org/2000/svg">

                            <polygon points="48,4 88,42 8,42" fill="none" stroke="url(#roofGrad)" strokeWidth="7" strokeLinejoin="round" />

                            <rect x="14" y="42" width="68" height="42" rx="2" fill="none" stroke="url(#bodyGrad)" strokeWidth="6" />
                            
                            <rect x="38" y="56" width="20" height="28" rx="3" fill="#c0392b" />

                            <path d="M4 72 Q24 62 48 72 Q72 82 92 72" stroke="url(#waveGrad)" strokeWidth="4" fill="none" strokeLinecap="round" />

                            <defs>

                                <linearGradient id="roofGrad" x1="8" y1="4" x2="88" y2="42" gradientUnits="userSpaceOnUse">

                                    <stop stopColor="#2ecc71" /><stop offset="1" stopColor="#1a7a3c" />

                                </linearGradient>

                                <linearGradient id="bodyGrad" x1="14" y1="42" x2="82" y2="84" gradientUnits="userSpaceOnUse">

                                    <stop stopColor="#00b3a4" /><stop offset="1" stopColor="#2980b9" />

                                </linearGradient>

                                <linearGradient id="waveGrad" x1="4" y1="72" x2="92" y2="72" gradientUnits="userSpaceOnUse">

                                    <stop stopColor="#2980b9" /><stop offset="0.6" stopColor="#5dade2" /><stop offset="1" stopColor="#c9a227" />

                                </linearGradient>
                                
                            </defs>

                        </svg>

                    </div>

                    <div className="brand-name">Servi<span>Credith</span></div>

                    <div className="brand-tagline">Creciendo Juntos</div>

                </div>

                <div className="brand-divider" />
                
                <p className="brand-description">

                    Únete a nuestra red de inversiones y forma parte de una comunidad que crece
                    contigo. Gestiona tus créditos e inversiones con total confianza.

                </p>

                <div className="wave-bar" />

            </div>

            {/* RIGHT FORM PANEL */}
            <div className="form-panel">

                <div className="card">


                    {/* BANNER DE EEEEEEXITO */}
                    {success&&(

                        <div className="success-banner">

                            <span className="success-icon">✓</span>

                            <div>

                                <strong>¡Registro exitoso!</strong>

                                <p>Tu cuenta ha sido creada correctamente.</p>

                            </div>

                        </div>

                    )}

                    <h2 className="card-title">Crear Cuenta</h2>
                    <p className="card-subtitle">Completa el formulario para registrarte en ServiCredith</p>

                    <form onSubmit={handleSubmit} noValidate>

                        <div className="form-grid">


                            {/* PRIMER NOMBRE */}
                            <div className="field-group">

                                <label htmlFor="primerNombre">Primer Nombre <span className="required">*</span></label>
                                
                                <input

                                    id="primerNombre" name="primerNombre" type="text"
                                    placeholder="Ej. Juan"
                                    value={form.primerNombre}
                                    onChange={handleChange} onBlur={handleBlur}
                                    className={fieldClass("primerNombre")}

                                />
                                {touched.primerNombre&&errors.primerNombre&&(

                                    <span className="error-msg">⚠ {errors.primerNombre}</span>

                                )}

                            </div>

                            {/* SEGUNDO NOMBRE */}

                            <div className="field-group">

                                <label htmlFor="segundoNombre">Segundo Nombre</label>
                                
                                <input

                                    id="segundoNombre" name="segundoNombre" type="text"
                                    placeholder="Ej. Carlos"
                                    value={form.segundoNombre}
                                    onChange={handleChange} onBlur={handleBlur}
                                    className={fieldClass("segundoNombre")}

                                />

                            </div>

                            {/* PRIMER APELLIDO */}

                            <div className="field-group">

                                <label htmlFor="primerApellido">Primer Apellido <span className="required">*</span></label>

                                <input

                                    id="primerApellido" name="primerApellido" type="text"
                                    placeholder="Ej. García"
                                    value={form.primerApellido}
                                    onChange={handleChange} onBlur={handleBlur}
                                    className={fieldClass("primerApellido")}

                                />
                                {touched.primerApellido&&errors.primerApellido&&(

                                    <span className="error-msg">⚠ {errors.primerApellido}</span>

                                )}

                            </div>

                            {/* SEGUNDO APELLIDO */}

                            <div className="field-group">

                                <label htmlFor="segundoApellido">Segundo Apellido</label>

                                <input

                                    id="segundoApellido" name="segundoApellido" type="text"
                                    placeholder="Ej. López"
                                    value={form.segundoApellido}
                                    onChange={handleChange} onBlur={handleBlur}
                                    className={fieldClass("segundoApellido")}

                                />

                            </div>

                            {/* EMAIL */}

                            <div className="field-group full">

                                <label htmlFor="email">Correo Electrónico <span className="required">*</span></label>

                                <input
                                
                                    id="email" name="email" type="email"
                                    placeholder="correo@ejemplo.com"
                                    value={form.email}
                                    onChange={handleChange} onBlur={handleBlur}
                                    className={fieldClass("email")}

                                />

                                {touched.email&&errors.email&&(

                                    <span className="error-msg">⚠ {errors.email}</span>

                                )}

                            </div>

                            {/* PASSWORD */}
                            <div className="field-group full">

                                <label htmlFor="password">Contraseña <span className="required">*</span></label>

                                <div className="password-wrapper">

                                    <input

                                        id="password" name="password" type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        value={form.password}
                                        onChange={handleChange} onBlur={handleBlur}
                                        className={fieldClass("password")}

                                    />
                                    {form.password.length>0&&
                                    (
                                        <div className="strength-bar">

                                            <div

                                                className={`strength-fill strength-${form.password.length<6?"weak" :

                                                    form.password.length<10?"medium":"strong"

                                                }`}

                                                style={{width: `${Math.min((form.password.length/12)*100,100)}%`}}
                                                
                                            />

                                        </div>

                                    )}

                                </div>
                                {touched.password&&errors.password &&(

                                    <span className="error-msg">⚠ {errors.password}</span>

                                )}
                                {!errors.password && form.password.length>0&&(

                                    <span className={`strength-label strength-label-${form.password.length < 6 ? "weak" :

                                        form.password.length<10?"medium":"strong"

                                    }`}>

                                        {form.password.length<6?"Contraseña débil":
                                            form.password.length<10?"Contraseña aceptable":"Contraseña fuerte ✓"}

                                    </span>
                                )}
                            </div>

                            {/* TIENDA */}

                            <div className="field-group full">

                                <label htmlFor="tienda">Tienda <span className="required">*</span></label>

                                <div className={`select-wrapper ${fieldClass("tienda")}`}>

                                    <select

                                        id="tienda" name="tienda"
                                        value={form.tienda}
                                        onChange={handleChange} onBlur={handleBlur}

                                    >

                                        <option value="" disabled>Selecciona tu tienda</option>

                                        {stores.map((s)=>
                                        (

                                            <option key={s} value={s}>{s}</option>

                                        ))}
                                    </select>

                                </div>

                                {touched.tienda&&errors.tienda&&(

                                    <span className="error-msg">⚠ {errors.tienda}</span>

                                )}

                            </div>


                        </div>


                        <button type="submit" className={`btn-register ${loading?"btn-loading":""}`} disabled={loading}>

                            {loading?<span className="spinner"/>:"Registrarse"}

                        </button>

                    </form>

                    <p className="login-prompt">

                        ¿Ya tienes una cuenta?

                        <a href="/login">Inicia sesión</a>

                    </p>

                </div>
                
            </div>

        </div>

    );

}
