import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const userId = 1;

        axios.get(`http://localhost:8080/api/products?userId=${userId}`)
            .then(res => {
                setProducts(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load products');
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <h1 className="text-4xl font-bold mb-8">All Products</h1>

            {loading ? (
                <p className="text-center text-xl">Loading...</p>
            ) : error ? (
                <p className="text-center text-red-600 text-xl">{error}</p>
            ) : products.length === 0 ? (
                <p className="text-center text-gray-600">No products available</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(p => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            )}
        </div>
    );
}