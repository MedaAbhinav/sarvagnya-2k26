import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

// Using HashRouter so GitHub Pages works without server-side routing config.
// URLs will be: https://medaabhinav.github.io/sarvagnya-2k26/#/support etc.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#102a43',
            color: '#f0ead4',
            border: '1px solid #c49a38',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#c49a38', secondary: '#102a43' },
          },
          error: {
            iconTheme: { primary: '#722f37', secondary: '#f0ead4' },
          },
        }}
      />
    </HashRouter>
  </React.StrictMode>
)
