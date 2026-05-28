import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./components/inde.css"//variables CSS globales + reset, siempre primero
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
