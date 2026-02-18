import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogIn, LogOut, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function Navbar() {
    const { totalItems } = useCart();
    const { user, logout } = useAuth(); // user may be null if not logged in
    const navigate = useNavigate();

    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    const handleLogout = () => {
        logout();
        window.location.href = '/login'; // ← Hard refresh after logout
    };

    useEffect(() => {
        console.log('Navbar - current user loyalty points:', user?.loyaltyPoints);
    }, [user]);

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-indigo-600">
                        AI Shop
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-8">
                        <Link to="/products" className="text-gray-700 hover:text-indigo-600">
                            Products
                        </Link>
                        <Link to="/orders" className="text-indigo-600 hover:underline">View Order History</Link>

                        {/* Cart with badge */}
                        <Link to="/cart" className="relative flex items-center text-gray-700 hover:text-indigo-600">
                            <ShoppingCart className="w-6 h-6" />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                            <span className="ml-2">Cart</span>
                        </Link>

                        {user && isAdmin && (
                            <Link to="/admin/add-product" className="...">
                                + Add Product
                            </Link>
                        )}

                        {/* Auth Section */}
                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-gray-600" />
                                    <span className="text-gray-700 font-medium">
                                        Hi, {user.username || 'User'} • {user.loyaltyPoints ?? 0} pts
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center text-gray-700 hover:text-red-600 transition-colors"
                                >
                                    <LogOut className="w-5 h-5 mr-1" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/login"
                                    className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors"
                                >
                                    <LogIn className="w-5 h-5 mr-1" />
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}