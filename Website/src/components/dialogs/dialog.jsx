import './dialog.css'

export default function Dialog({ 
    title,
    openButtonTxt,
    openButtonStyle,
    dialogStyle,
    children,
    isOpen,
    setIsOpen }) {
    const openTxt = openButtonTxt || 'Click me!'

    return (
        <>
            <button style={openButtonStyle}
                onClick={() => setIsOpen(true)}>
                { openTxt }
            </button>
            {isOpen ? (
                <div className='dialog'>
                    <div className='dialog-content'
                        style={dialogStyle}>
                        <span className='dialog-close'
                            onClick={() => setIsOpen(false)}>
                            &times;
                        </span>
                        <h2 className='dialog-title'>
                            {title}
                        </h2>
                        {children}
                    </div>
                </div>
            ) : null}
        </>
    );
}
