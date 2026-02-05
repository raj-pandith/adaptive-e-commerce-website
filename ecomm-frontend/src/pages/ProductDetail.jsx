import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
    const { id } = useParams(); // product ID from URL
    const userId = 1; // fake user (later from real login)
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch the main product
        axios.get(`http://localhost:8080/api/products?userId=${userId}`)
            .then(res => {
                const found = res.data.find(p => p.id === Number(id));
                if (found) {
                    setProduct(found);
                } else {
                    setError('Product not found');
                }
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load product');
            });

        // Fetch similar products
        axios.get(`http://localhost:8080/api/products/${id}/similar?userId=${userId}&limit=6`)
            .then(res => setSimilar(res.data))
            .catch(err => console.error('Similar error:', err))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="text-center py-20 text-xl">Loading...</div>;
    if (error) return <div className="text-center py-20 text-red-600 text-xl">{error}</div>;
    if (!product) return <div className="text-center py-20 text-gray-600">Product not found</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Main Product */}
            <div className="grid md:grid-cols-2 gap-12 mb-16">
                {/* Image placeholder */}
                <div className="bg-gray-100 aspect-square rounded-xl flex items-center justify-center">
                    <span className="text-6xl text-gray-300">Product Image</span>
                </div>

                {/* Info */}
                <div>
                    <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

                    <div className="flex items-baseline gap-4 mb-6">
                        <span className="text-5xl font-bold text-green-600">
                            ₹{product.suggestedPrice?.toFixed(2)}
                        </span>

                        {product.discountPercent > 0 && (
                            <div className="flex gap-3">
                                <span className="text-2xl text-gray-500 line-through">
                                    ₹{product.originalPrice.toFixed(2)}
                                </span>
                                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-lg font-medium">
                                    {product.discountPercent}% OFF
                                </span>
                            </div>
                        )}
                    </div>

                    <p className="text-lg text-gray-600 mb-8">{product.reason}</p>

                    <button
                        onClick={() => addToCart(product)}
                        className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition w-full md:w-auto"
                    >
                        Add to Cart
                    </button>
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