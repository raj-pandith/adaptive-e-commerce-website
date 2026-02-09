import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';

export default function PaymentSuccess() {
    const location = useLocation();
    const orderId = location.state?.orderId || 'ORD-' + Date.now();
    const amount = location.state?.amount || 0;

    // Trigger confetti animation on load
    useEffect(() => {
        // Fire confetti multiple times for that Google Pay vibe
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;

        const interval = setInterval(() => {
            if (Date.now() > animationEnd) {
                clearInterval(interval);
                return;
            }

            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#00ff00', '#00cc00', '#009900']
            });

            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#00ff00', '#00cc00', '#009900']
            });

            confetti({
                particleCount: 10,
                spread: 70,
                origin: { y: 0.6 }
            });
        }, 250);

        // Cleanup
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Animated Checkmark */}
                <div className="mx-auto mb-8 relative">
                    <div className="w-32 h-32 mx-auto rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                        <svg
                            className="w-20 h-20 text-green-600 animate-checkmark"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="4"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>

                {/* Success Message */}
                <h1 className="text-4xl font-bold text-green-700 mb-4">
                    Payment Successful!
                </h1>
                <p className="text-xl text-gray-700 mb-2">
                    Thank you for shopping with AI Shop
                </p>

                {/* Order Details */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="space-y-3">
                        <div className="flex justify-between text-lg">
                            <span className="text-gray-600">Order ID:</span>
                            <span className="font-medium">{orderId}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                            <span className="text-gray-600">Amount Paid:</span>
                            <span className="font-bold text-green-600">₹{Number(amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="font-medium">UPI / Card (Demo)</span>
                        </div>
                    </div>
                </div>

                {/* Next Actions */}
                <div className="space-y-4">
                    <Link
                        to="/"
                        className="block bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition"
                    >
                        Back to Home
                    </Link>

                    <Link
                        to="/orders"  // you can create this page later
                        className="block bg-gray-100 text-gray-800 py-4 rounded-xl font-semibold hover:bg-gray-200 transition"
                    >
                        View Order History
                    </Link>
                </div>
            </div>
        </div>
    );
}