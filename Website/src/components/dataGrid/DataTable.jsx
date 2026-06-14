import { Children, cloneElement, useEffect, useState } from 'react'
import { LeftArrow, Pencil, RightArrow, Tash } from '@/assets/icons'
import './DataTable.css'

export function DataColumn() {
  return null
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
  return <CustomAction {...props} backgroundColor="#dc2626" color="#ffffff" icon={Tash} tooltip="Eliminar" />
}

export function ActionColumn({ children, row }) {
  return (
    <td>
      <div className="actions-cell">
        {Children.map(children, (child) =>
          child?.type?.name === 'CustomAction' ||
          child?.type?.name === 'UpdateAction' ||
          child?.type?.name === 'DeleteAction'
            ? cloneElement(child, { row })
            : child
        )}
      </div>
    </td>
  )
}

export function DataTable({ onLoad, children, rowTitle, onRowClick, rowsPerPage = 10 }) {
  const [data, setData] = useState([])
  const [maxCount, setMaxCount] = useState(0)
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(maxCount / rowsPerPage))

  const columns = []
  for (const child of children) {
    if (!child || !child.type) continue

    if (child.type.name === 'DataColumn') {
      const { title, propertyName } = child.props

      if (!title && !propertyName) continue

      columns.push({
        type: 'data',
        title: title || propertyName,
        propertyName: propertyName || title,
      })
    } else if (child.type.name === 'ActionColumn') {
      columns.push({
        type: 'action',
        element: child,
      })
    }
  }

  useEffect(() => {
    if (!onLoad) return undefined

    let cancelled = false
    const offset = (page - 1) * rowsPerPage

    onLoad(offset, rowsPerPage).then((result) => {
      if (!cancelled) {
        setData(result.data || [])
        setMaxCount(result.total ?? 0)
      }
    })

    return () => {
      cancelled = true
    }
  }, [page, rowsPerPage, onLoad])

  const dataColumnCount = columns.length || 1

  const header = (
    <thead>
      <tr className="table-header">
        {columns.map((column, index) =>
          column.type === 'action' ? (
            <th key={index} className="table-header-item table-header-action"></th>
          ) : (
            <th key={index} className="table-header-item">
              {column.title}
            </th>
          )
        )}
      </tr>
    </thead>
  )

  const rows =
    data.length === 0 ? (
      <tr>
        <td className="data-table-empty" colSpan={dataColumnCount}>
          Sin datos
        </td>
      </tr>
    ) : (
      data.map((row, rowIndex) => (
        <tr key={row.storeId || row.companyId || row.roleId || rowIndex} title={rowTitle} onClick={() => onRowClick?.(row)}>
          {columns.map((column, columnIndex) =>
            column.type === 'action' ? (
              cloneElement(column.element, { key: columnIndex, row })
            ) : (
              <td key={columnIndex}>{row[column.propertyName]}</td>
            )
          )}
        </tr>
      ))
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
