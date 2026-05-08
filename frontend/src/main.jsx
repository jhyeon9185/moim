import { StrictMode } from 'react'

if (window.Kakao && !window.Kakao.isInitialized()) {
  const jsKey = import.meta.env.VITE_KAKAO_JS_KEY || import.meta.env.VITE_KAKAO_CLIENT_ID
  window.Kakao.init(jsKey)
}
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
