import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClinicaApp } from './ClinicaApp'

import 'temporal-polyfill/global';
import '@schedule-x/theme-default/dist/index.css';
import './index.css'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClinicaApp />
  </StrictMode>
)
