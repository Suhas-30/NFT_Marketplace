import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { WalletProvider } from './context/WalletContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <WalletProvider>
    <App /> 
  </WalletProvider>
       
  </StrictMode>
)
