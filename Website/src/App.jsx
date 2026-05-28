import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from './pages/RegisterPage'
import Home from './pages/home'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/*" element={<Home/>}/>
            </Routes>
        </BrowserRouter>
    )
}
