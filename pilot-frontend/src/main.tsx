import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App/App.tsx'
import './index.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DroneProvider } from './contexts/DronesContext.tsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { DroneParameters } from './DroneParameters/DroneParameters.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DroneProvider>    
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/drone/:id/parameters" element={<DroneParameters />} />
        </Routes>
      </Router>
      <ToastContainer />
    </DroneProvider>
  </StrictMode>,
)
