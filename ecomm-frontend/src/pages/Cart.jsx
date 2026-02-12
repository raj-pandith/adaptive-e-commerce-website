import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
    const cartContext = useCart();
    const { cart = [], removeFromCart, updateQuantity, clearCart } = cartContext || {};

    const navigate = useNavigate();

    // Safe total - fallback to 0 if anything goes wrong
    const total = Array.isArray(cart)
        ? cart.reduce((sum, item) => {
            const price = Number(item?.suggestedPrice ?? item?.originalPrice ?? 0);
            const quantity = Number(item?.quantity) || 1;
            return sum + price * quantity;
        }, 0)
        : 0;

    // Debug: see what's actually in context
    console.log("Cart context debug:", { cartContext, cartLength: cart.length, calculatedTotal: total });

    if (cart.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Your Cart is Empty</h2>
                <p className="text-xl text-gray-600 mb-8">Looks like you haven't added anything yet.</p>
                <Link
                    to="/products"
                    className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-indigo-700 transition"
                >
                    Start Shopping →
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <h1 className="text-4xl font-bold mb-10 text-gray-900">Your Cart</h1>

            <div className="space-y-6 mb-12">
                {cart.map((item, index) => {
                    const price = Number(item?.suggestedPrice ?? item?.originalPrice ?? 0);
                    const quantity = Number(item?.quantity) || 1;

                    return (
                        <div
                            key={item?.id || index} // fallback key if id missing
                            className="flex flex-col sm:flex-row items-center gap-6 bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                        >
                            {/* Image */}
                            <div className="w-32 h-32 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                <img
                                    src={item?.url || item?.image || 'https://via.placeholder.com/128?text=No+Image'}
                                    alt={item?.name || 'Product'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/128?text=Image+Error';
                                    }}
                                />
                            </div>

                            {/* Details */}
                            <div className="flex-grow">
                                <h3 className="text-xl font-semibold mb-2">{item?.name || 'Unnamed Product'}</h3>

                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-2xl font-bold text-green-600">
                                        ₹{Number(price).toFixed(2) || '0.00'}
                                    </span>

                                    {Number(item?.discountPercent) > 0 && (
                                        <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                            {Number(item.discountPercent).toFixed(1)}% off
                                        </span>
                                    )}
                                </div>

                                {/* Quantity */}
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => updateQuantity?.(item?.id, quantity - 1)}
                                        disabled={quantity <= 1}
                                        className="w-10 h-10 bg-gray-200 rounded-full text-xl hover:bg-gray-300 disabled:opacity-50 transition"
                                    >
                                        −
                                    </button>

                                    <span className="text-xl font-medium w-12 text-center">
                                        {quantity}
                                    </span>

                                    <button
                                        onClick={() => updateQuantity?.(item?.id, quantity + 1)}
                                        className="w-10 h-10 bg-gray-200 rounded-full text-xl hover:bg-gray-300 transition"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Subtotal */}
                            <div className="text-right min-w-[140px]">
                                <p className="text-xl font-bold mb-3">
                                    ₹{Number(price * quantity).toFixed(2) || '0.00'}
                                </p>
                                <button
                                    onClick={() => removeFromCart?.(item?.id)}
                                    className="text-red-600 hover:text-red-800 font-medium transition"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="bg-white p-8 rounded-lg shadow-md text-right">
                <div className="flex justify-between items-center mb-6 text-2xl">
                    <span className="font-semibold text-gray-800">Total:</span>
                    <span className="font-bold text-green-600">
                        ₹{Number(total).toFixed(2) || '0.00'}
                    </span>
                </div>

                <Link
                    state={{ amount: total }}
                    to="/checkout/address"
                    className="inline-block w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition text-center"
                >
                    Proceed to Checkout
                </Link>
            </div>
        </div>
    );
}