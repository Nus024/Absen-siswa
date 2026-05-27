import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'

// StrictMode dinonaktifkan karena html5-qrcode tidak kompatibel
// dengan React StrictMode double-mount di development mode
createRoot(document.getElementById('root')).render(<App />)

