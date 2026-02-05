import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { totalItems } = useCart();

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-2xl font-bold text-indigo-600">
                        AI Shop
                    </Link>

                    <div className="flex items-center space-x-8">
                        <Link to="/products" className="text-gray-700 hover:text-indigo-600">
                            Products
                        </Link>

                        <Link to="/cart" className="relative flex items-center text-gray-700 hover:text-indigo-600">
                            <ShoppingCart className="w-6 h-6" />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                            <span className="ml-2">Cart</span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}