import { useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export default function PaymentSuccess() {
    const location = useLocation();
    const { orderId, amount } = location.state || {};

    useEffect(() => {
        // Confetti animation
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-10 text-center">
                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-4xl font-bold text-green-700 mb-4">Payment Successful!</h1>

                <p className="text-xl text-gray-700 mb-8">
                    Thank you for your purchase!
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Order ID:</span>
                            <span className="font-medium">{orderId || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Amount Paid:</span>
                            <span className="font-bold text-green-600">₹{Number(amount || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Link
                        to="/orders"
                        className="block w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition"
                    >
                        View Order History
                    </Link>

                    <Link
                        to="/"
                        className="block w-full bg-gray-100 text-gray-800 py-4 rounded-xl font-semibold hover:bg-gray-200 transition"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}