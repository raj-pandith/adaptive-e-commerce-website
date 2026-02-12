import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth(); // Get real logged-in user
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleBuyNow = () => {
        if (!product) return;
        addToCart(product);
        navigate('/cart');
    };

    useEffect(() => {
        // Wait for auth to finish loading
        if (authLoading) return;

        // If no user → redirect to login (protect page)
        if (!user?.id) {
            setError('Please login to view personalized pricing and details');
            setLoading(false);
            navigate('/login');
            return;
        }

        // Reset state when product ID or user changes
        setLoading(true);
        setError(null);
        setProduct(null);
        setSimilar([]);

        const fetchData = async () => {
            try {
                // 1. Fetch current product with personalized price
                const productRes = await axios.get(
                    `http://localhost:8080/api/products/${id}?userId=${user.id}`
                );
                setProduct(productRes.data);
                {
                    console.log(productRes.data)
                }

                // 2. Fetch similar products (also personalized)
                const similarRes = await axios.get(
                    `http://localhost:8080/api/products/${id}/similar?userId=${user.id}&limit=8`
                );
                setSimilar(similarRes.data);
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to load product details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

    }, [id, user?.id, authLoading, navigate]); // Re-run when ID or user changes

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-600">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-20 text-red-600 text-xl">{error}</div>;
    }

    if (!product) {
        return <div className="text-center py-20 text-gray-600">Product not found</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Back button */}
            <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
                ← Back to Home
            </Link>

            <div className="grid md:grid-cols-2 gap-12 mb-16">
                {/* Image */}
                <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square">
                    <img
                        src={product.image}
                        alt={product.name || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/600?text=Image+Not+Found';
                            e.target.onerror = null; // prevent infinite loop
                        }}
                    />
                </div>

                {/* Details */}
                <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{product.name}</h1>

                    {/* Price & Discount */}
                    <div className="flex flex-wrap items-baseline gap-4 mb-6">
                        <span className="text-5xl md:text-6xl font-bold text-green-600">
                            ₹{product.suggestedPrice?.toFixed(2)}
                        </span>

                        {product.discountPercent > 0 && (
                            <div className="flex items-center gap-3">
                                <span className="text-2xl md:text-3xl text-gray-500 line-through">
                                    ₹{product.originalPrice?.toFixed(2)}
                                </span>
                                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-lg md:text-xl font-medium">
                                    {product.discountPercent}% OFF
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Reason / Badge */}
                    {product.reason && (
                        <div className="inline-block bg-indigo-50 text-indigo-700 px-5 py-2 rounded-full text-base font-medium mb-6">
                            {product.reason}
                        </div>
                    )}

                    {/* Styled Description */}
                    <div className="border-t border-gray-200 pt-8">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-5">Description</h3>

                        <div className="prose prose-lg prose-indigo max-w-none text-gray-700 leading-relaxed">
                            {product.desc ? (
                                <p className="text-lg">{product.desc}</p>
                            ) : (
                                <p className="text-gray-500 italic">No detailed description available for this product.</p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <button
                            onClick={() => addToCart(product)}
                            className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition shadow-md active:scale-98"
                        >
                            Add to Cart
                        </button>

                        <button
                            onClick={handleBuyNow}
                            className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition shadow-md active:scale-98"
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Similar Products */}
            {similar.length > 0 && (
                <div>
                    <h2 className="text-3xl font-bold mb-8">You May Also Like</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {similar.map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}