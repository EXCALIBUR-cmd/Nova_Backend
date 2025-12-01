import React from 'react'
import './App.css'
import AppRoutes from './AppRoutes'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  )
}

export default App