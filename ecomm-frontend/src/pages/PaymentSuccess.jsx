import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

export default function PaymentSuccess() {
    const location = useLocation();
    const orderId = location.state?.orderId || `ORD-${Date.now().toString().slice(-8)}`;
    const amount = location.state?.amount || 0;

    // Example: 10 points per ₹100 spent (customize as needed)
    const pointsEarned = Math.floor(amount / 100) * 10;

    // Confetti + scaling animation
    useEffect(() => {
        // Confetti burst
        const duration = 4500; // 4.5 seconds
        const end = Date.now() + duration;

        const interval = setInterval(() => {
            if (Date.now() > end) {
                clearInterval(interval);
                return;
            }

            confetti({
                particleCount: 6,
                angle: 60,
                spread: 60,
                origin: { x: 0 },
                colors: ['#00ff99', '#00cc77', '#009955'],
            });

            confetti({
                particleCount: 6,
                angle: 120,
                spread: 60,
                origin: { x: 1 },
                colors: ['#00ff99', '#00cc77', '#009955'],
            });

            confetti({
                particleCount: 15,
                spread: 80,
                origin: { y: 0.6 },
                startVelocity: 35,
            });
        }, 280);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center transform transition-all duration-700 scale-100">
                {/* Animated Checkmark + Ring */}
                <div className="mx-auto mb-10 relative">
                    <div className="w-44 h-44 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl animate-bounce-slow">
                        <svg
                            className="w-32 h-32 text-white animate-checkmark-scale"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="4"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping-slow"></div>
                </div>

                {/* Success Title */}
                <h1 className="text-5xl md:text-6xl font-extrabold text-green-700 mb-4 animate-fade-in">
                    Payment Successful!
                </h1>

                <p className="text-xl md:text-2xl text-gray-700 mb-10 animate-fade-in delay-200">
                    Thank you for shopping with AI Shop!
                </p>

                {/* Order Summary Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 mb-12 animate-fade-in delay-300">
                    <div className="space-y-6 text-left">
                        <div className="flex justify-between items-center text-lg md:text-xl">
                            <span className="text-gray-600 font-medium">Order ID</span>
                            <span className="font-bold text-gray-900">{orderId}</span>
                        </div>

                        <div className="flex justify-between items-center text-lg md:text-xl">
                            <span className="text-gray-600 font-medium">Amount Paid</span>
                            <span className="font-bold text-green-600 text-2xl md:text-3xl">
                                ₹{Number(amount).toFixed(2)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-lg md:text-xl">
                            <span className="text-gray-600 font-medium">Loyalty Points Earned</span>
                            <span className="font-bold text-indigo-600 text-xl md:text-2xl">
                                +{pointsEarned} pts
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-lg md:text-xl">
                            <span className="text-gray-600 font-medium">Payment Method</span>
                            <span className="font-medium text-gray-800">UPI / Card (Demo)</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in delay-500">
                    <Link
                        to="/"
                        className="bg-indigo-600 text-white py-5 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition transform hover:scale-105 shadow-md"
                    >
                        Back to Home
                    </Link>

                    <Link
                        to="/orders" // Placeholder — create real orders page later
                        className="bg-gray-100 text-gray-800 py-5 rounded-xl font-semibold text-lg hover:bg-gray-200 transition transform hover:scale-105 shadow-md"
                    >
                        View Order Details
                    </Link>
                </div>

                {/* Small footer note */}
                <p className="mt-10 text-sm text-gray-500 animate-fade-in delay-700">
                    A confirmation has been sent to your email. Track your order anytime!
                </p>
            </div>
        </div>
    );
}