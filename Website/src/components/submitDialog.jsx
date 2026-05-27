import Dialog from "./dialog";
import './submitDialog.css'

export function SubmitDialog({
    title,
    buttonStyle,
    dialogStyle,
    onAccept,
    acceptText,
    acceptStyle,
    onClose,
    closeText,
    closeStyle,
    children,
    isOpen,
    setIsOpen }) {
    const acceptTxt = acceptText || 'Aceptar'
    const closeTxt = closeText || 'Cancelar'

    return (
        <>
            <Dialog title={title}
                buttonStyle={buttonStyle}
                dialogStyle={dialogStyle}
                isOpen={isOpen}
                setIsOpen={setIsOpen}>

                {children}

                <div className="submit-container">
                    <button className="close-btn"
                        style={closeStyle}
                        onClick={onClose}>
                        {closeTxt}
                    </button>

                    <button className="submit-btn"
                        style={acceptStyle}
                        onClick={onAccept}>
                        {acceptTxt}
                    </button>
                </div>
            </Dialog>
        </>
    )
}
