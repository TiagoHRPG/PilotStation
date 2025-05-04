import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { DroneParameters } from './parameters/DroneParameters.tsx';
import { LogsPage } from './pages/LogsPage.tsx';
import { LogViewerPage } from './pages/LogViewerPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/drone/:id/parameters" element={<DroneParameters />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/logs/:filename" element={<LogViewerPage />} />
        </Routes>
      </Router>
      <ToastContainer />
  </StrictMode>,
)
