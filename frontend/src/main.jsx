import 'bootstrap/dist/css/bootstrap.min.css'
import './theme.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const savedTheme = localStorage.getItem('theme') || 'light'
document.documentElement.dataset.theme = savedTheme
document.documentElement.dataset.bsTheme = savedTheme

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
