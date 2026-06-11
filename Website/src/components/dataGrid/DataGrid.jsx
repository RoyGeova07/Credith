import './DataGrid.css'

export function HeaderButton({ className, buttonText, onClick }) {
  return <input className={className} value={buttonText} onClick={onClick} type="button" />
}

export function HeaderTextFilter({ className, filterPlaceholder, value, onChange }) {
  return (
    <input
      className={className}
      placeholder={filterPlaceholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      type="text"
    />
  )
}

export function DataGridHeader({ title, description, onAddClick, addButtonTxt, children }) {
  const addTxt = addButtonTxt || 'Agregar'

  return (
    <>
      <div className="data-grid-header">
        <div>
          {description && <p className="data-grid-kicker">{description}</p>}
          <h1 className="data-grid-header-title">{title}</h1>
        </div>
        <button className="add-element-click" onClick={onAddClick}>
          {addTxt}
        </button>
      </div>
      <form className="data-grid-filters">{children}</form>
    </>
  )
}

export function DataGrid({ children }) {
  return <div className="data-grid">{children}</div>
}
