// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { trackVisit } from './utils/analytics';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages - Auth
import LoginPage from './pages/LoginPage';
import RegisterCustomerPage from './pages/RegisterCustomerPage';
import RegisterProviderPage from './pages/RegisterProviderPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Pages - Customer
import HomePage from './pages/HomePage';
import ProvidersPage from './pages/ProvidersPage';
import ProviderProfilePage from './pages/ProviderProfilePage';
import MessagesPage from './pages/MessagesPage';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';

// Pages - Provider
import ProviderDashboardPage from './pages/ProviderDashboardPage';

// Pages - Admin
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProviders from './pages/admin/AdminProviders';
import AdminConversations from './pages/admin/AdminConversations';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userProfile } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (requiredRole && userProfile?.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  useEffect(() => { trackVisit(); }, []);

  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { fontFamily: 'Heebo', direction: 'rtl' } }} />
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterCustomerPage />} />
        <Route path="/register-provider" element={<RegisterProviderPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="providers" element={<AdminProviders />} />
          <Route path="conversations" element={<AdminConversations />} />
        </Route>

        {/* Main App */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="providers" element={<ProvidersPage />} />
          <Route path="providers/:id" element={<ProviderProfilePage />} />
          <Route path="messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="messages/:conversationId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="provider-dashboard" element={<ProtectedRoute requiredRole="provider"><ProviderDashboardPage /></ProtectedRoute>} />
        </Route>
      </Routes>
    </>
  );
}
