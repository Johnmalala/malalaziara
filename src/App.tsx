import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import { AdminLayout } from './components/layouts/AdminLayout';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { LoadingPage } from './components/UI/LoadingSpinner';

// Main Pages
import Home from './pages/main/Home';
import Experiences from './pages/main/Experiences';
import Stays from './pages/main/Stays';
import Volunteers from './pages/main/Volunteers';
import ListingDetail from './pages/ListingDetail';
import CustomPackage from './pages/main/CustomPackage';
import BookingPage from './pages/BookingPage';

// Auth Pages
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import CheckEmail from './pages/auth/CheckEmail';

// Dashboard Pages
import DashboardIndex from './pages/dashboard/DashboardIndex';
import MyBookings from './pages/dashboard/MyBookings';
import MyWishlist from './pages/dashboard/MyWishlist';
import ProfileSettings from './pages/dashboard/ProfileSettings';
import SecuritySettings from './pages/dashboard/SecuritySettings';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import ListingsManagement from './pages/admin/ListingsManagement';
import BookingsManagement from './pages/admin/BookingsManagement';
import PartnersManagement from './pages/admin/PartnersManagement';
import RequestsManagement from './pages/admin/RequestsManagement';
import SettingsManagement from './pages/admin/SettingsManagement';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage message="Authenticating..." />;
  if (!user) return <Navigate to="/signin" replace />;
  return <>{children}</>;
}

function DashboardEntryPoint() {
  const { isAdmin, loading } = useAuth();
  if (loading) return <LoadingPage message="Loading Dashboard..." />;
  
  if (isAdmin) {
    return (
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    );
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

// A wrapper to decide which component to show on the dashboard index
const SmartDashboardIndex = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <DashboardIndex />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <Routes>
              {/* Public pages with MainLayout */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/experiences" element={<Experiences />} />
                <Route path="/stays" element={<Stays />} />
                <Route path="/volunteers" element={<Volunteers />} />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/custom-package" element={<CustomPackage />} />
                <Route path="/book/:listingId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
              </Route>
              
              {/* Auth pages without MainLayout */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/check-email" element={<CheckEmail />} />
              
              {/* Dashboard and Admin Routes */}
              <Route 
                path="/dashboard"
                element={<ProtectedRoute><DashboardEntryPoint /></ProtectedRoute>}
              >
                <Route index element={<SmartDashboardIndex />} />
                
                {/* User-specific dashboard routes */}
                <Route path="my-bookings" element={<MyBookings />} />
                <Route path="my-wishlist" element={<MyWishlist />} />
                <Route path="profile" element={<ProfileSettings />} />
                <Route path="security" element={<SecuritySettings />} />
                
                {/* Admin-specific routes */}
                <Route path="listings" element={<ListingsManagement />} />
                <Route path="bookings" element={<BookingsManagement />} />
                <Route path="partners" element={<PartnersManagement />} />
                <Route path="requests" element={<RequestsManagement />} />
                <Route path="settings" element={<SettingsManagement />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CurrencyProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
