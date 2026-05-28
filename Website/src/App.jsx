import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './home'

import './App.css'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/home" element={<Home/>}/>
            </Routes>
        </BrowserRouter>
    )
}
