import './dialog.css'

export default function Dialog({ 
    title,
    openButtonStyle,
    dialogStyle,
    children,
    isOpen,
    setIsOpen }) {
    return (
        <>
            <button style={openButtonStyle}
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
