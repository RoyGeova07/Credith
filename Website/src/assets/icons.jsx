// Icons taken from: https://heroicons.com/outline

export function LeftArrow({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-4.28 9.22a.75.75 0 0 0 0 1.06l3 3a.75.75 0 1 0 1.06-1.06l-1.72-1.72h5.69a.75.75 0 0 0 0-1.5h-5.69l1.72-1.72a.75.75 0 0 0-1.06-1.06l-3 3Z"
                clipRule="evenodd"
            />
        </svg>
    )
}

export function RightArrow({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm4.28 10.28a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 1 0-1.06 1.06l1.72 1.72H8.25a.75.75 0 0 0 0 1.5h5.69l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3Z"
                clipRule="evenodd"
            />
        </svg>
    )
}

export function Update({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
    )
}

export function Tash({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} >
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
    )
}

export function Archive({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} >
            <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
        </svg>
    )
}

export function Pencil({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} >
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
        </svg>
    )
}

export function Restore({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} >
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992V4.356m0 0-5.364 5.364a8.25 8.25 0 1 0 2.122 5.53" />
        </svg>
    )
}

export function HomeIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} >
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.125 1.125 0 0 1 1.592 0L21.75 12M4.5 9.75v10.125A1.125 1.125 0 0 0 5.625 21h3.75v-4.875A1.125 1.125 0 0 1 10.5 15h3a1.125 1.125 0 0 1 1.125 1.125V21h3.75a1.125 1.125 0 0 0 1.125-1.125V9.75" />
        </svg>
    )
}

export function BuildingIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M5.25 21V6.75A.75.75 0 0 1 6 6h3v15m0 0V3.75A.75.75 0 0 1 9.75 3h4.5a.75.75 0 0 1 .75.75V21m0 0h3V9.75A.75.75 0 0 0 17.25 9h-3" />
        </svg>
    )
}

export function StoreIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75h18M4.5 9.75v8.25A2.25 2.25 0 0 0 6.75 20.25h10.5A2.25 2.25 0 0 0 19.5 18V9.75M7.5 9.75V6.375A1.875 1.875 0 0 1 9.375 4.5h5.25A1.875 1.875 0 0 1 16.5 6.375V9.75" />
        </svg>
    )
}

export function UsersIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path
                strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a8.97 8.97 0 0 0-6-2.22 8.97 8.97 0 0 0-6 2.22M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
    )
}

export function TagIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 5.25 10.5 10.5-4.5 4.5L4.5 9.75V5.25H9Z" />
        </svg>
    )
}

export function CreditCardIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5m-18 0v8.25A2.25 2.25 0 0 0 6 18.75h12a2.25 2.25 0 0 0 2.25-2.25V8.25" />
        </svg>
    )
}

export function DocumentIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21H9a2.25 2.25 0 0 1-2.25-2.25V5.25A2.25 2.25 0 0 1 9 3h6.879a2.25 2.25 0 0 1 1.591.659l2.871 2.871A2.25 2.25 0 0 1 21 8.121V19.5A1.5 1.5 0 0 1 19.5 21Z" />
        </svg>
    )
}

export function ExportDocumentIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
    )
}

export function ChartIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M8 16V9m4 7V5m4 11v-8" />
        </svg>
    )
}

//botoncito de configuracion, no se usa pero lo dejo por si acaso
export function CogIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.592c.55 0 1.02.398 1.11.94l.213 1.277a7.53 7.53 0 0 1 1.555.9l1.192-.48a1.125 1.125 0 0 1 1.375.486l1.296 2.244a1.125 1.125 0 0 1-.265 1.45l-.98.818c.045.33.068.666.068 1.005 0 .339-.023.675-.068 1.005l.98.818a1.125 1.125 0 0 1 .265 1.45l-1.296 2.244a1.125 1.125 0 0 1-1.375.486l-1.192-.48a7.53 7.53 0 0 1-1.555.9l-.213 1.277c-.09.542-.56.94-1.11.94h-2.592c-.55 0-1.02-.398-1.11-.94l-.213-1.277a7.53 7.53 0 0 1-1.555-.9l-1.192.48a1.125 1.125 0 0 1-1.375-.486L2.53 15.633a1.125 1.125 0 0 1 .265-1.45l.98-.818A7.787 7.787 0 0 1 3.707 12c0-.339.023-.675.068-1.005l-.98-.818a1.125 1.125 0 0 1-.265-1.45l1.296-2.244a1.125 1.125 0 0 1 1.375-.486l1.192.48a7.53 7.53 0 0 1 1.555-.9l.213-1.277Z" />
        </svg>
    )
}

export function BagIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24"> <path d="M7.5 8.2h9l.7 10a2 2 0 0 1-2 2.2H8.8a2 2 0 0 1-2-2.2l.7-10Z" />
            <path d="M9.2 8.2V6.9a2.8 2.8 0 0 1 5.6 0v1.3" />
            <path d="M10 12.2h4" />
        </svg>
    )
}

export function BoxIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5 12 3 3 7.5m18 0v9L12 21m9-13.5L12 12M3 7.5v9L12 21m0-9v9" />
        </svg>
    )
}

export function CartIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M4.4 5.8h2.1l1.7 8.4a2 2 0 0 0 2 1.6h6.4a2 2 0 0 0 1.9-1.4l1.2-4.6H8.1" />
            <path d="M10.4 20.2a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z" />
            <path d="M17.2 20.2a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z" />
        </svg>
    )
}

export function UserRoleIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0M18.75 9.75l2.25.75v3c0 2.485-1.53 4.69-3.75 5.625-2.22-.935-3.75-3.14-3.75-5.625v-3l2.25-.75a4.7 4.7 0 0 0 3 0Z" />
        </svg>
    )
}

export function SalesIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386a1.125 1.125 0 0 1 1.106.93l.383 2.298m0 0h13.739a1.125 1.125 0 0 1 1.097 1.374l-1.125 4.5a1.125 1.125 0 0 1-1.097.853H7.031a1.125 1.125 0 0 1-1.106-.93L5.125 6.228Zm2.625 13.272a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm11.25 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
        </svg>
    )
}
