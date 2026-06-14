import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Pages
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import AdsManagement from './pages/AdsManagement';
import UserManager from './pages/UserManager';
import Withdrawals from './pages/Withdrawals';
import NewsEditor from './pages/NewsEditor';
import AdminSettings from './pages/AdminSettings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/ads" element={<AdminLayout><AdsManagement /></AdminLayout>} />
        <Route path="/users" element={<AdminLayout><UserManager /></AdminLayout>} />
        <Route path="/withdrawals" element={<AdminLayout><Withdrawals /></AdminLayout>} />
        <Route path="/news" element={<AdminLayout><NewsEditor /></AdminLayout>} />
        <Route path="/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
