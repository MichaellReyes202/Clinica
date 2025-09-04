import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ClinicaApp } from './ClinicaApp'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClinicaApp />
  </StrictMode>
)
