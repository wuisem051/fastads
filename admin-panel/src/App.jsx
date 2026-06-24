import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';

// Layouts & Pages
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import AdsManagement from './pages/AdsManagement';
import UserManager from './pages/UserManager';
import Withdrawals from './pages/Withdrawals';
import NewsEditor from './pages/NewsEditor';
import AdminSettings from './pages/AdminSettings';
import LandingEditor from './pages/LandingEditor';
import FaucetManager from './pages/FaucetManager';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<PrivateRoute><AdminLayout><Dashboard /></AdminLayout></PrivateRoute>} />
        <Route path="/ads" element={<PrivateRoute><AdminLayout><AdsManagement /></AdminLayout></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><AdminLayout><UserManager /></AdminLayout></PrivateRoute>} />
        <Route path="/withdrawals" element={<PrivateRoute><AdminLayout><Withdrawals /></AdminLayout></PrivateRoute>} />
        <Route path="/news" element={<PrivateRoute><AdminLayout><NewsEditor /></AdminLayout></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><AdminLayout><AdminSettings /></AdminLayout></PrivateRoute>} />
        <Route path="/landing" element={<PrivateRoute><AdminLayout><LandingEditor /></AdminLayout></PrivateRoute>} />
        <Route path="/faucet" element={<PrivateRoute><AdminLayout><FaucetManager /></AdminLayout></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
