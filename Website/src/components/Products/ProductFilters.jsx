import "./ProductFilters.css"

export default function ProductFilters({search,onSearchChange,productCount = 0,onCategoriesClick,onShowArchivedClick,categories,showCategories,selectedCategory,setSelectedCategory,setShowCategories,showArchived}) 
{

    return(
        
        <div className="product-filters">

            <div className="product-search-wrapper">

                <svg

                    className="product-search-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"

                >

                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />

                </svg>

                <input

                    className="product-search-input"
                    placeholder="Buscar productos por nombre..."
                    value={search}
                    onChange={(e) => onSearchChange?.(e.target.value)}

                />
            </div>

            <div className="product-filters-right">

                <div style={{ position: "relative" }}>

                    <button
                        className="filter-btn"
                        onClick={onCategoriesClick}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                        </svg>

                        {selectedCategory || "Categories"}

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    {
                        showCategories &&

                        <div className="categories-menu">

                            <div
                                className="category-item"
                                onClick={() => {

                                    setSelectedCategory("")
                                    setShowCategories(false)

                                }}
                            >

                                Todas

                            </div>

                            {
                                categories?.map(category => (

                                    <div
                                        className="category-item"
                                        key={category.categoryId}
                                        onClick={() => {

                                            setSelectedCategory(category.name)
                                            setShowCategories(false)

                                        }}

                                    >

                                        {category.name}

                                    </div>

                                ))
                            }

                        </div>
                    }

                </div>

                <button

                    className="filter-btn"
                    onClick={onShowArchivedClick}
                    
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="21 8 21 21 3 21 3 8" />
                        <rect x="1" y="3" width="22" height="5" />
                        <line x1="10" y1="12" x2="14" y2="12" />
                    </svg>

                    {

                        showArchived?"Mostrar Productos":"Mostrar Archivados"

                    }

                </button>

                <span className="product-count">
                    {/* {productCount} */}
                </span>

            </div>

        </div>
    )
}