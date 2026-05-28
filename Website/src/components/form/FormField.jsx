import'./FormField.css'

export default function FormField({inputName,description,placeholder,value,onChange,onBlur,type="text",minLength,pattern,error,touched,required=false,className='',})
{

    return(

        <div className={`field-group ${className}`}>

            <label htmlFor={inputName}>

                {description}

                {required&&(

                    <span className="required">*</span>

                )}


            </label>

            <input 

                id={inputName}
                name={inputName}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                minLength={minLength}
                pattern={pattern}

                className={touched?error?'input-error':'input-ok':''}

            />

            {touched&&error&&(

                <span className="error-msg">

                    ⚠ {error}

                </span>

            )}

        </div>

    )

}