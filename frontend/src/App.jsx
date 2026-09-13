import React, { lazy, Suspense, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Login from './authentication/login';
import Register from './authentication/register';
import VerifyEmail from './authentication/VerifyEmail';
import ForgotPassword from './authentication/ForgotPassword';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF8F1] flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl border border-[#2B1D17]/10">
            <h2 className="font-serif text-2xl font-bold text-[#2B1D17] mb-3">Something went wrong</h2>
            <p className="text-[#2B1D17]/60 text-sm mb-6">
              We encountered an unexpected error. Please refresh the page to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#F47A20] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#d96613] transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// admin-view import (lazy loaded to minimize bandwidth for normal users)
const AdminRegister = lazy(() => import('./authentication/adminregister'));
const AdminLayout = lazy(() => import('./Admin-Frontend/Components/AdminLayout'));
const MenuManagement = lazy(() => import('./Admin-Frontend/Pages/MenuManagement'));
const Orders = lazy(() => import('./Admin-Frontend/Pages/Orders'));
const Customers = lazy(() => import('./Admin-Frontend/Pages/Customers'));
const Admins = lazy(() => import('./Admin-Frontend/Pages/Admins'));
const Branches = lazy(() => import('./Admin-Frontend/Pages/Branches'));
const AdminProfile = lazy(() => import('./Admin-Frontend/Pages/Profile'));
const Dashboard = lazy(() => import('./Admin-Frontend/Pages/Dashboard'));
const Reports = lazy(() => import('./Admin-Frontend/Pages/Reports'));
const Settings = lazy(() => import('./Admin-Frontend/Pages/Settings'));

//user-view import
import GuestLayout from './User-Frontend/GuestLayout.jsx';
import Home from './User-Frontend/pages/Home.jsx';
import Menu from './User-Frontend/pages/Menu.jsx';
import CategoryPage from './User-Frontend/pages/CategoryPage.jsx';
import Support from './User-Frontend/pages/Support.jsx';
import AboutUs from './User-Frontend/pages/AboutUs.jsx';
import Contact from './User-Frontend/pages/Contact.jsx';
import Policies from './User-Frontend/pages/Policies.jsx';
import Profile from './User-Frontend/pages/Profile.jsx';
import Cart from './User-Frontend/pages/Cart.jsx';
import Checkout from './User-Frontend/pages/Checkout.jsx';
import Billing from './User-Frontend/pages/Billing.jsx';
import OrderConfirmation from './User-Frontend/pages/OrderConfirmation.jsx';
import { CartProvider, useCart } from './User-Frontend/context.cart.jsx';
import Toast from './User-Frontend/components/Toast.jsx';

// Authentication
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <ToastWrapper />
          <Router>
          <ScrollToTop />
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FFF8F1] text-[#2B1D17]">Loading...</div>}>
            <Routes>
              {/* Public: landing redirect */}
              <Route path="/" element={<Navigate to="/user/home" replace />} />

              {/* Public: auth pages */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/adminregister" element={<AdminRegister />} />

              {/* Admin Routes - Protected (admin only) */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="menumanagement" element={<MenuManagement />} />
                <Route path="orders" element={<Orders />} />
                <Route path="customers" element={<Customers />} />
                <Route path="admins" element={<Admins />} />
                <Route path="branches" element={<Branches />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>

            {/* Public: guest browsing routes — open to everyone */}
            <Route element={<GuestLayout />}>
              <Route path="/user/home" element={<Home />} />
              <Route path="/user/menu" element={<Menu />} />
              <Route path="/user/menu/:category" element={<CategoryPage />} />
              <Route path="/user/support" element={<Support />} />
              <Route path="/user/about-us" element={<AboutUs />} />
              <Route path="/user/contact" element={<Contact />} />
              <Route path="/user/policies" element={<Policies />} />
              <Route path="/user/cart" element={<Cart />} />
              <Route path="/user/checkout" element={<Checkout />} />
              <Route path="/user/billing" element={<Billing />} />
            </Route>

            {/* Protected: account-specific routes — require login */}
            <Route path="/user/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/user/order-confirmation" element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/user/home" replace />} />
          </Routes>
          </Suspense>
        </Router>
      </CartProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}
export default App;

function ToastWrapper() {
  const { toast } = useCart();
  return <Toast visible={toast.visible} message={toast.message} />;
}
