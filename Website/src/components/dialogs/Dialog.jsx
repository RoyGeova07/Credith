import './Dialog.css'

export default function Dialog({ 
    title,
    children,
    isOpen,
    setIsOpen }) {

    return (
        <>
            {isOpen ? (
                <div className='dialog'>
                    <div className='dialog-content'>
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
