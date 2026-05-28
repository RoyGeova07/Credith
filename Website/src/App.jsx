import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from './pages/RegisterPage'
import LoginPage from "./pages/LoginPage";
import Home from './pages/home'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/*" element={<Home/>}/>
            </Routes>
        </BrowserRouter>
    )
}
