import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Login from './authentication/login';
import Register from './authentication/register';
import VerifyEmail from './authentication/VerifyEmail';
import ForgotPassword from './authentication/ForgotPassword';

//admin-view import
import AdminRegister from './authentication/adminregister';
import AdminLayout from './Admin-Frontend/Components/AdminLayout';
import MenuManagement from './Admin-Frontend/Pages/MenuManagement';
import Orders from './Admin-Frontend/Pages/Orders';
import Customers from './Admin-Frontend/Pages/Customers';
import Admins from './Admin-Frontend/Pages/Admins';
import Branches from './Admin-Frontend/Pages/Branches';
import AdminProfile from './Admin-Frontend/Pages/Profile';
import Dashboard from './Admin-Frontend/Pages/Dashboard';
import Reports from './Admin-Frontend/Pages/Reports';
import Settings from './Admin-Frontend/Pages/Settings';

//user-view import
import GuestLayout from './User-Frontend/GuestLayout.jsx';
import Intro from './User-Frontend/pages/intro.jsx';
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
    <AuthProvider>
      <CartProvider>
        <ToastWrapper />
        <Router>
          <ScrollToTop />
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
              <Route path="/user/intro" element={<Intro />} />
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
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
export default App;

function ToastWrapper() {
  const { toast } = useCart();
  return <Toast visible={toast.visible} message={toast.message} />;
}
