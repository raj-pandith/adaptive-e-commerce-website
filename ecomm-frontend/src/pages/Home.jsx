import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Use userId = 1 for testing (later use real user from login)
        const userId = 1;

        axios.get(`http://localhost:8080/api/products?userId=${userId}&limit=8`)
            .then(response => {
                setProducts(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching products:', err);
                setError('Could not load products. Is Spring Boot running on port 8080?');
                setLoading(false);
            });
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 text-center rounded-xl mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Welcome to Adaptive E commerce Website
                </h1>
                <p className="text-xl mb-8 max-w-2xl mx-auto">
                    Personalized price , smart recommendations and promotion of products
                </p>

                <p className="text-xl mb-8 max-w-2xl mx-auto">
                    Just for you !
                </p>

                <div className="mb-12">
                    <SearchBar />
                </div>
                <a
                    href="/products"
                    className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition"
                >
                    Start Shopping →
                </a>
            </div>

            {/* Products Section */}
            <section>
                <h2 className="text-3xl font-bold mb-8 text-center md:text-left">Featured Products</h2>

                {loading ? (
                    <p className="text-center text-xl text-gray-600">Loading real products from backend...</p>
                ) : error ? (
                    <p className="text-center text-xl text-red-600">{error}</p>
                ) : products.length === 0 ? (
                    <p className="text-center text-xl text-gray-600">No products found in database</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}