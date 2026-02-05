import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ProductCard from './components/ProductCard';
import Cart from './pages/Cart';

function App() {
  return (
    // <Router>
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar is used here – it appears on every page */}
      <Navbar />

      {/* Main content area */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          {/* Add more routes later */}
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </main>

      {/* Optional footer */}
      <footer className="bg-gray-800 text-white py-4 text-center">
        <p>© 2026 Adaptive E-Commerce </p>
      </footer>
    </div>
    // </Router>
  );
}

export default App;