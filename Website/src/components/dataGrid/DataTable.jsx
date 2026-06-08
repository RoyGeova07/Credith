import './DataTable.css'

export function DataColumn({
    propertyName,
    title,
}) {
    return <th>{title}</th>
}

export function DataTable({ 
    onLoad,
    children,
}) {
    let names = []

    for(let c of children) {
        if (c.type.name !== 'DataColumn')
            continue

        const props = c.props;
        let prop = null

        if ('title' in props)
            prop = props['title']

        if ('propertyName' in props)
            prop = props['propertyName']

        if (!prop) continue

        names.push(prop)
    }

    return (
        <div className='data-table-div'>
            <table className='data-table'>
                <tr>
                    {children}
                </tr>
            </table>
            <div className='data-table-paging'>
                <button>
                       |-
                </button>
                <p>
                Pagina: X/Y
                </p>
                <button>
                       -|
                </button>
            </div>
        </div>
    )
}
