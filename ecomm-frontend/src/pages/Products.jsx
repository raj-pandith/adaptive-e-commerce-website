import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

export default function Products() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Wait for auth to finish loading
        if (authLoading) return;

        // If no user → redirect to login
        if (!user?.id) {
            navigate('/login');
            return;
        }

        // Fetch personalized products
        setLoading(true);
        setError(null);

        axios.get(`http://localhost:8080/api/products?userId=${user.id}&limit=20`)
            .then(res => {
                setProducts(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please try again later.');
                setLoading(false);
            });

    }, [user?.id, authLoading, navigate]); // Re-fetch when user or auth state changes

    // Show loading while waiting for auth or data
    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-600">Loading personalized products...</p>
                </div>
            </div>
        );
    }

    // Not logged in (safety net)
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">Please Login</h2>
                    <p className="text-xl text-gray-600 mb-8">
                        You need to be logged in to see personalized offers and prices.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-indigo-700 transition"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                    All Products
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                    Personalized offers just for you • Loyalty points: <span className="font-bold text-indigo-600">{user.loyaltyPoints ?? 0}</span>
                </p>
            </div>

            {/* Products Grid */}
            {error ? (
                <p className="text-center text-xl text-red-600 py-10">{error}</p>
            ) : products.length === 0 ? (
                <p className="text-center text-xl text-gray-600 py-10">No products available right now</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}