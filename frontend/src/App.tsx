import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';

const isAuth = () => !!localStorage.getItem('hedgeiq_token');

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuth() ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/login" element={isAuth() ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/dashboard" element={isAuth() ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
