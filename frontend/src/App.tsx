import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import About from './components/legal/About';
import Privacy from './components/legal/Privacy';
import Terms from './components/legal/Terms';
import Security from './components/legal/Security';
import Contact from './components/legal/Contact';
import Status from './components/legal/Status';

const isAuth = () => !!localStorage.getItem('hedgeiq_token');

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuth() ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/login" element={isAuth() ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/dashboard" element={isAuth() ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/security" element={<Security />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/status" element={<Status />} />
      </Routes>
    </BrowserRouter>
  );
}
