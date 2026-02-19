// src/components/RecommendedProducts.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../../src/components/ProductCard';
import { useAuth } from '../context/AuthContext';

export default function RecommendedProducts({ limit = 6, title = "Recommended for You" }) {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        const fetchRecommendations = async () => {
            try {
                // Step 1: Get recommended product IDs for this user
                const recRes = await axios.get(
                    `http://localhost:8080/api/recommendations?userId=${user.id}&limit=${limit}`
                );

                const recommendedIds = recRes.data; // array of product IDs
                console.log(recommendedIds)
                if (recommendedIds.length === 0) {
                    setProducts([]);
                    setLoading(false);
                    return;
                }

                // Step 2: Fetch full product details for those IDs
                const productsRes = await axios.get(
                    `http://localhost:8080/api/products?ids=${recommendedIds.join(',')}`
                );

                setProducts(productsRes.data);
            } catch (err) {
                console.error('Failed to load recommendations:', err);
                setError('Could not load recommendations');
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [user?.id, limit]);

    if (!user) return null; // Don't show recommendations to guests

    if (loading) {
        return (
            <div className="py-8 text-center text-gray-600">
                Loading recommendations...
            </div>
        );
    }

    if (error || products.length === 0) {
        return null; // or show fallback popular products
    }

    return (
        <section className="py-12">
            <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}