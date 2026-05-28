import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/home'
import RegisterPage from './pages/RegisterPage'

import './App.css'


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
