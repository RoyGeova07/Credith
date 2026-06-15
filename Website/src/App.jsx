import { BrowserRouter, Route, Routes } from 'react-router-dom'
import DataGridTest from './pages/DataGridTest'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import AdminCompanyManagementPage from '@/pages/AdminCompanyManagementPage'
import AdminRoleManagementPage from '@/pages/AdminRoleManagementPage'
import AdminStoreManagementPage from '@/pages/AdminStoreManagementPage'
import CartDemoPage from '@/pages/CartDemoPage'
import ManagerEmployeesManagementPage from '@/pages/ManagerEmployeesManagementPage'
import Home from './pages/Home'
import ProductsPage from "./pages/ProductsPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"
import { Navigate } from "react-router-dom";
import { getUserRole } from "./helpers/session";
import OwnerCategoryManagementPage from "./pages/OwnerCategoryManagementPage";

function ProtectedRoute({children,allowedRoles})
{

    let role=getUserRole()
    if(role==="sin-rol")
    {

        role="EMPLOYEE"

    }

    if(!allowedRoles.includes(role))
    {

        return <Navigate to="/"replace/>

    }
    return children

}

export default function App() 
{

    return(

        <BrowserRouter>

            <Routes>

                <Route path="/register" element={<RegisterPage />} />
                <Route path="/data-grid" element={<DataGridTest />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin/companies" element={<ProtectedRoute allowedRoles={["OWNER"]}><AdminCompanyManagementPage/></ProtectedRoute>}/>
                <Route path="/products" element={<ProtectedRoute allowedRoles={["OWNER","ADMIN"]}><ProductsPage/></ProtectedRoute>} />
                <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={["OWNER"]}><AdminRoleManagementPage/></ProtectedRoute>}/>
                <Route path="/admin/stores" element={<ProtectedRoute allowedRoles={["OWNER","ADMIN"]}><AdminStoreManagementPage/></ProtectedRoute>}/>
                <Route path="/owner/category"element={<ProtectedRoute allowedRoles={["OWNER"]}><OwnerCategoryManagementPage/></ProtectedRoute>}/>
                <Route path="/cart" element={<CartDemoPage/>}/>
                <Route path="/*" element={<Home/>}/>
                
            </Routes>

            <ToastContainer

                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                pauseOnHover
                draggable
                theme="colored"
                toastStyle={{

                    background:
                        "linear-gradient(90deg,#1e8e3e 0%, #35b36b 50%, #3182ce 100%)",

                    color: "white",
                    borderRadius: "12px",
                    fontWeight: "600",
                    boxShadow: "0 8px 20px rgba(0,0,0,.18)"

                }}

            />

        </BrowserRouter>



    )
}
