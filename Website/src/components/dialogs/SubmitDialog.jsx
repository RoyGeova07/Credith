import Dialog from "./Dialog";
import './SubmitDialog.css'

export default function FormDialog({
    title,
    onAccept,
    acceptText,
    onClose,
    closeText,
    children,
    isOpen,
    setIsOpen,acceptDisabled=false}) {
    const acceptTxt = acceptText || 'Aceptar'
    const closeTxt = closeText || 'Cancelar'

    return (
        <>
            <Dialog title={title}
                isOpen={isOpen}
                setIsOpen={setIsOpen}>

                {children}

                <div className="submit-container">
                    <button className="close-btn"
                        onClick={onClose}>
                        {closeTxt}
                    </button>

                    <button className="submit-btn"

                        onClick={onAccept}
                        disabled={acceptDisabled}

                    >

                        {acceptTxt}

                    </button>
                </div>
            </Dialog>
        </>
    )
}
