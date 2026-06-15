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
import ProductsPage from './pages/ProductsPage'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function App() 
{
  
  return(
    
    <BrowserRouter>
    
      <Routes>
    
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/data-grid" element={<DataGridTest />} />
        <Route path="/admin/companies" element={<AdminCompanyManagementPage />} />
        <Route path="/admin/roles" element={<AdminRoleManagementPage />} />
        <Route path="/admin/stores" element={<AdminStoreManagementPage />} />
        <Route path="/manager/employees" element={<ManagerEmployeesManagementPage />} />
        <Route path="/cart" element={<CartDemoPage />} />
        <Route path="*" element={<Home />} />
          
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
          background: 'linear-gradient(90deg,#1e8e3e 0%, #35b36b 50%, #3182ce 100%)',
          color: 'white',
          borderRadius: '12px',
          fontWeight: '600',
          boxShadow: '0 8px 20px rgba(0,0,0,.18)',
        }}
        
      />

    </BrowserRouter>

  )
  
}
