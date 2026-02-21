import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

export default function Products() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [products, setProducts] = useState([]); // always array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination state
    const itemsPerPage = 15;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Read page from URL on mount / change
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = parseInt(params.get('page')) || 1;
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    }, [location.search]);

    // Fetch products when user, page, or auth changes
    useEffect(() => {
        if (authLoading) return;
        if (!user?.id) {
            navigate('/login');
            return;
        }

        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await axios.get(
                    `http://localhost:8080/api/products?userId=${user.id}&pageSize=${itemsPerPage}&page=${currentPage}`
                );
                console.log(res)

                const data = res.data;

                // Handle both possible response shapes safely
                const productList = Array.isArray(data) ? data : (data?.products || []);
                const total = data?.totalCount || productList.length;
                const pages = data?.totalPages || Math.ceil(total / itemsPerPage);

                setProducts(productList);
                setTotalCount(total);
                setTotalPages(pages || 1);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please try again.');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [user?.id, authLoading, currentPage]); // Removed navigate from deps

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
        // Update URL without full reload
        navigate(`?page=${newPage}`, { replace: true });
    };

    // Generate page numbers (show up to 5 around current page)
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    // Loading screen
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

    // Not logged in fallback
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">Please Login</h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Login to see personalized products and offers.
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
                    Personalized just for you • Loyalty points:{' '}
                    <span className="font-bold text-indigo-600">{user.loyaltyPoints ?? 0}</span>
                </p>
            </div>

            {/* Products Grid */}
            {error ? (
                <p className="text-center text-xl text-red-600 py-10">{error}</p>
            ) : products.length === 0 ? (
                <p className="text-center text-xl text-gray-600 py-10">
                    No products found at the moment
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {(products || []).map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex flex-wrap justify-center items-center gap-3">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors ${currentPage === 1
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                            >
                                Previous
                            </button>

                            {getPageNumbers().map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-4 py-2 rounded-lg font-medium min-w-[40px] transition-colors ${page === currentPage
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors ${currentPage === totalPages
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}