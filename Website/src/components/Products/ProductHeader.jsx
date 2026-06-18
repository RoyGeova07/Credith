import "./ProductHeader.css"

export default function ProductHeader({onCreate,canCreate=true}) 
{

    return(
        <div className="product-header">

            <div className="product-header-text">

                <h1>Gestion de productos</h1>
                <p>Gestionar el catálogo de productos y el inventario en todas las sucursales.</p>

            </div>
            
            {

                canCreate&&
                (

                    <button

                        className="new-product-btn"
                        onClick={onCreate}

                    >

                        + Nuevo Producto
                        
                    </button>

                )

            }

        </div>
    )

}