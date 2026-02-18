import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Register from './pages/Register';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';
import PaymentSuccess from './pages/PaymentSuccess';
import CheckoutAddress from './pages/CheckoutAddress';
import CheckoutPayment from './pages/CheckoutPayment';
import OrderHistory from './pages/OrderHistory';
import AdminAddProduct from './pages/admin/AdminAddProduct';


const stripePromise = loadStripe('pk_test_51SySIgLSqdiJPgAF5dhc5lDxHEHVDsy803fYwUFMv7FmEX4JBiZj7WDT2LVnckjWoEKvmJ84W1nnmSeFVZpKiP0S003IWJtsp1');

// 1. General Protected Route (for normal logged-in users)
function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}

// 2. Admin-only Protected Route (this is the one you asked for)
function AdminProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  // Check both: logged in AND role is ADMIN
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
function App() {
  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen flex flex-col bg-gray-50">

        <Navbar />

        <main className="grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout/address" element={<CheckoutAddress />} />

              <Route path="/checkout/payment" element={<CheckoutPayment />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/orders" element={<OrderHistory />} />
              {/* <Route element={<AdminProtectedRoute />}> */}
              <Route path="/admin/add-product" element={<AdminAddProduct />} />
              {/* </Route> */}
            </Route>
          </Routes>

        </main>

        <footer className="bg-gray-800 text-white py-4 text-center">
          <p>© 2026 Adaptive E-Commerce</p>
        </footer>

      </div>
    </Elements>
  );
}

export default App;
