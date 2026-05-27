import { useState } from 'react'
import './dialog.css'

export default function Dialog({ title, buttonStyle, dialogStyle, children }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <button style={buttonStyle}
                onClick={() => setIsOpen(true)}>
                Click me
            </button>
            {isOpen ? (
                <div className='dialog'>
                    <div className='dialog-content'
                        style={dialogStyle}>
                        <span className='dialog-close'
                            onClick={() => setIsOpen(false)}>
                            &times;
                        </span>
                        <h2>
                            {title}
                        </h2>
                        {children}
                    </div>
                </div>
            ) : null}
        </>
    );
}
