import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, loading: authLoading } = useAuth()

    useEffect(() => {
        // For public landing page: use a default/demo userId or no personalization
        // Option 1: Hardcoded demo user (temporary)
        const demoUserId = 1; // or remove ?userId= completely for non-personalized

        // Option 2: No userId (backend should return default prices)
        // axios.get('http://localhost:8080/api/products?limit=8')

        axios.get(`http://localhost:8080/api/products?userId=${demoUserId}&limit=8`)
            .then(res => {
                setProducts(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching products:', err);
                setError('Could not load featured products.');
                setLoading(false);
            });
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 text-center rounded-xl mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Welcome to Adaptive E-Commerce
                </h1>
                <p className="text-xl mb-8 max-w-2xl mx-auto">
                    Discover personalized prices, smart recommendations, and exclusive promotions
                </p>
                <p className="text-lg mb-10 max-w-2xl mx-auto font-semibold">
                    Shop smarter – prices adapt to you!
                </p>

                <div className="mb-12 max-w-2xl mx-auto">
                    <SearchBar />
                </div>

                <Link
                    to="/products"
                    className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg"
                >
                    Start Shopping →
                </Link>
            </div>

            {/* Featured Products */}
            <section className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8 text-center">
                    Featured Products
                </h2>

                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-xl text-gray-600">Loading featured products...</p>
                    </div>
                ) : error ? (
                    <p className="text-center text-xl text-red-600">{error}</p>
                ) : products.length === 0 ? (
                    <p className="text-center text-xl text-gray-600">No featured products available</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* CTA */}
            <div className="text-center mt-16 py-12 bg-gray-50 rounded-xl">
                <h3 className="text-2xl font-bold mb-4">Ready to shop?</h3>
                <Link
                    to="/products"
                    className="inline-block bg-indigo-600 text-white px-10 py-5 rounded-full font-semibold hover:bg-indigo-700 transition text-lg"
                >
                    Browse All Products
                </Link>
            </div>
        </div>
    );
}