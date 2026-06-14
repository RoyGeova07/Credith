import { useState, useEffect, Children, cloneElement } from 'react'
import { LeftArrow, RightArrow, Pencil, Tash,Restore } from '@/assets/icons'
import './DataTable.css'

export function DataColumn({propertyName,title,render}) 
{

    return <></>

}

export function CustomAction({ row, backgroundColor, color = '#ffffff', icon: Icon, onClick, tooltip }) {
  return (
    <button
      className="action-btn"
      style={{ backgroundColor, color }}
      title={tooltip}
      onClick={(event) => {
        event.stopPropagation()
        onClick?.(row)
      }}
    >
      {Icon && <Icon className="action-icon" />}
    </button>
  )
}

export function UpdateAction(props) {
  return <CustomAction {...props} backgroundColor="#1a7a3c" color="#ffffff" icon={Pencil} tooltip="Editar" />
}

export function DeleteAction(props) {
    return <CustomAction {...props} backgroundColor="#dc2626" color="#ffffff" icon={Tash} tooltip="Eliminar-Archivar" />
}

export function ActionColumn({ children, row }) {
    return (
        <td>
            <div className='actions-cell'>
                {Children.map(children, child =>
                    child?.type?.name === 'CustomAction' ||
                        child?.type?.name === 'UpdateAction' ||
                        child?.type?.name === 'DeleteAction' ||
                        child?.type?.name==='RestoreAction'
                        ? cloneElement(child, { row })
                        : child
                )}
            </div>
        </td>
    )
}

export function RestoreAction(props)
{

    return(

        <CustomAction

            {...props}
            backgroundColor="#2563eb"
            color="#ffffff"
            icon={Restore}
            tooltip="Restaurar"

        />

    )

}

export function DataTable({
    onLoad,
    children,
    rowTitle,
    onRowClick,
    rowsPerPage = 10,
}) {
    const [data, setData] = useState([])
    const [maxCount, setMaxCount] = useState(0)
    const [page, setPage] = useState(1)

    const totalPages = Math.max(1, Math.ceil(maxCount / rowsPerPage))

    const columns = []
    for (let c of children) {
        if (!c || !c.type) continue

        if (c.type.name === 'DataColumn') {
            const props = c.props
            let title = null
            let propertyName = null

            if ('title' in props)
                title = props['title']

            if ('propertyName' in props)
                propertyName = props['propertyName']

            if (!title && !propertyName) continue

            columns.push({
                type: 'data',
                title: title || propertyName,
                propertyName: propertyName || title,
                render: props.render
            })
        } else if (c.type.name === 'ActionColumn') {
            columns.push({
                type: 'action',
                element: c,
            })
        }
    }
  }

  useEffect(() => {
    if (!onLoad) return undefined

    let cancelled = false
    const offset = (page - 1) * rowsPerPage

    const rows = data.length === 0
        ? (
            <tr>
                <td colSpan={dataColumnCount || 1}><h3>Sin datos</h3></td>
            </tr>
        )
        : data.map((row, rowIndex) => (
            <tr key={rowIndex} title={rowTitle} onClick={() => onRowClick ? onRowClick(row) : {}}>
                {columns.map((col, colIndex) => (
                    col.type === 'action'
                        ? cloneElement(col.element, { key: colIndex, row })
                        : <td key={colIndex}>
                            {
                                col.render
                                    ? col.render(row)
                                    : row[col.propertyName]
                            }
                        </td>
                ))}
            </tr>
        ))

    const handlePrev = () => setPage(p => Math.max(1, p - 1))
    const handleNext = () => setPage(p => Math.min(totalPages, p + 1))

    return (
        <div className='data-table-div'>
            <table className='data-table'>
                {header}
                <tbody>
                    {rows}
                </tbody>
            </table>
            <div className='data-table-paging'>
                <button onClick={handlePrev} disabled={page <= 1}>
                    <LeftArrow className="grid-paging-btn" />
                </button>
                <h3>Total: {maxCount}&nbsp;Pagina: {page}/{totalPages}</h3>
                <button onClick={handleNext} disabled={page >= totalPages}>
                    <RightArrow className="grid-paging-btn" />
                </button>
            </div>
        </div>
    )

  const handlePrev = () => setPage((current) => Math.max(1, current - 1))
  const handleNext = () => setPage((current) => Math.min(totalPages, current + 1))

  return (
    <div className="data-table-div">
      <div className="data-table-wrap">
        <table className="data-table">
          {header}
          <tbody>{rows}</tbody>
        </table>
      </div>

      <div className="data-table-paging">
        <button onClick={handlePrev} disabled={page <= 1}>
          <LeftArrow className="grid-paging-btn" />
        </button>
        <h3>
          Total: {maxCount}&nbsp;Pagina: {page}/{totalPages}
        </h3>
        <button onClick={handleNext} disabled={page >= totalPages}>
          <RightArrow className="grid-paging-btn" />
        </button>
      </div>
    </div>
  )
}
