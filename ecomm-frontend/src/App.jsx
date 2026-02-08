import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import PaymentSuccess from './pages/PaymentSuccess';

// Stripe publishable key
const stripePromise = loadStripe('pk_test_51SySIgLSqdiJPgAF5dhc5lDxHEHVDsy803fYwUFMv7FmEX4JBiZj7WDT2LVnckjWoEKvmJ84W1nnmSeFVZpKiP0S003IWJtsp1');

function App() {
  return (
    // <Router>
    <Elements stripe={stripePromise}>
      <div className="min-h-screen flex flex-col bg-gray-50">

        {/* Navbar */}
        <Navbar />

        {/* Main content */}
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-4 text-center">
          <p>© 2026 Adaptive E-Commerce</p>
        </footer>
      </div>
    </Elements>
    // </Router>
  );
}

export default App;
