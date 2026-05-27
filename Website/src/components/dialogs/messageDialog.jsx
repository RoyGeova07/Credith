import Dialog from './dialog'
import './messageDialog.css'

export default function MessageDialog({
    title,
    openButtonTxt,
    openButtonStyle,
    dialogStyle,
    children,
    isOpen,
    setIsOpen }) {
        return (
        <>
            <Dialog title={title}
                openButtonTxt={openButtonTxt}
                buttonStyle={openButtonStyle}
                dialogStyle={dialogStyle}
                isOpen={isOpen}
                setIsOpen={setIsOpen}>

                {children}

            </Dialog>
        </>
    )
}
