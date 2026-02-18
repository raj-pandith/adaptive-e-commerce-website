import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance'; // ← Use axiosInstance (with token)
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CheckoutForm from '../components/CheckoutForm';

export default function CheckoutPayment() {
    const { cart = [], total = 0, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Prefer amount from navigation state, fallback to cart total
    const amount = Number(location.state?.amount ?? total);

    const handleSuccess = async () => {
        if (!user?.id) {
            setError('User not logged in. Please login again.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Prepare safe order data
            const orderData = {
                userId: user.id,
                totalAmount: amount,
                items: cart.map(item => ({
                    productId: item.id,
                    name: item.name || 'Unnamed Product',
                    price: Number(item.suggestedPrice ?? item.originalPrice ?? 0),
                    quantity: Number(item.quantity) || 1
                })),
                address: (() => {
                    try {
                        const saved = localStorage.getItem("deliveryAddress");
                        return saved ? JSON.parse(saved) : {};
                    } catch {
                        return {};
                    }
                })()
            };

            console.log('Sending order data to backend:', orderData);

            // Save order using axiosInstance (includes Authorization header)
            const response = await axiosInstance.post('/api/orders', orderData);

            console.log('Order saved successfully:', response.data);

            // Clear cart & temp storage
            clearCart();
            localStorage.removeItem("deliveryAddress");

            // Navigate to success page
            navigate('/payment-success', {
                state: {
                    orderId: `ORD-${Date.now()}`,
                    amount
                }
            });
        } catch (err) {
            console.error('Order save error:', err);

            // Show specific backend message if available
            const backendError = err.response?.data?.message
                || err.response?.data?.error
                || err.message
                || 'Failed to save order history (payment was successful)';

            setError(backendError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Payment</h1>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center">
                    {error}
                </div>
            )}

            <div className="bg-white p-8 rounded-xl shadow-lg">
                <p className="text-xl font-semibold mb-6 text-center">
                    Amount to Pay: <span className="text-green-600 font-bold">
                        ₹{Number(amount).toFixed(2)}
                    </span>
                </p>

                {loading && (
                    <div className="text-center mb-4 text-gray-600 flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing your order...
                    </div>
                )}

                <CheckoutForm
                    amount={Number(amount)}
                    onSuccess={handleSuccess}
                />
            </div>
        </div>
    );
}