import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CheckoutForm from "./CheckoutForm";

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
    const navigate = useNavigate();

    const total = cart.reduce((sum, item) => {
        const price = Number(item.suggestedPrice ?? item.originalPrice ?? 0);
        return sum + price * item.quantity;
    }, 0);



    if (cart.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">
                    Your Cart is Empty
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                    Looks like you haven't added anything yet.
                </p>
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
            <h1 className="text-4xl font-bold mb-10">Your Cart</h1>

            <div className="space-y-6 mb-12">
                {cart.map((item) => {
                    const price = Number(item.suggestedPrice ?? item.originalPrice ?? 0);
                    const discount = Number(item.discountPercent ?? 0);

                    return (
                        <div
                            key={item.id}
                            className="flex flex-col sm:flex-row items-center gap-6 bg-white p-6 rounded-lg shadow-md"
                        >
                            {/* Image */}
                            <div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-gray-400">Image</span>
                            </div>

                            {/* Details */}
                            <div className="flex-grow">
                                <h3 className="text-xl font-semibold mb-2">{item.name}</h3>

                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-2xl font-bold text-green-600">
                                        ₹{price.toFixed(2)}
                                    </span>

                                    {discount > 0 && (
                                        <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                            {discount.toFixed(1)}% off
                                        </span>
                                    )}
                                </div>

                                {/* Quantity */}
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() =>
                                            updateQuantity(item.id, item.quantity - 1)
                                        }
                                        disabled={item.quantity <= 1}
                                        className="w-10 h-10 bg-gray-200 rounded-full text-xl hover:bg-gray-300 disabled:opacity-50"
                                    >
                                        −
                                    </button>

                                    <span className="text-xl font-medium w-12 text-center">
                                        {item.quantity}
                                    </span>

                                    <button
                                        onClick={() =>
                                            updateQuantity(item.id, item.quantity + 1)
                                        }
                                        className="w-10 h-10 bg-gray-200 rounded-full text-xl hover:bg-gray-300"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Subtotal */}
                            <div className="text-right min-w-[140px]">
                                <p className="text-xl font-bold mb-3">
                                    ₹{(price * item.quantity).toFixed(2)}
                                </p>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-red-600 hover:text-red-800 font-medium"
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
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-green-600">
                        ₹{total.toFixed(2)}
                    </span>
                </div>


                <CheckoutForm
                    amount={total}
                    onSuccess={() => {
                        setTimeout(() => {
                            navigate("/payment-success", {
                                state: {
                                    orderId: "ORD-" + Date.now(),
                                    amount: total
                                }
                            });
                        }, 300); // 🔑 allow Stripe iframe cleanup
                    }}
                />
            </div>
        </div>
    );
}
