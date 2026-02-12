import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
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

    // Use passed amount from state, fallback to cart total
    const amount = Number(location.state?.amount ?? total);

    const handleSuccess = async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Prepare order data
            const orderData = {
                userId: user?.id,
                totalAmount: amount,
                items: cart.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.suggestedPrice || item.originalPrice || 0,
                    quantity: item.quantity || 1
                })),
                address: JSON.parse(localStorage.getItem("deliveryAddress") || "{}")
            };

            // 2. Save order to backend
            await axios.post('http://localhost:8080/api/orders', orderData);

            // 3. Clear cart
            clearCart();

            // 4. Clear temp address (optional)
            localStorage.removeItem("deliveryAddress");

            // 5. Go to success page
            navigate('/payment-success', {
                state: {
                    orderId: `ORD-${Date.now()}`,
                    amount
                }
            });
        } catch (err) {
            console.error('Order save error:', err);
            setError('Payment succeeded but failed to save order history.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center">Payment</h1>

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
                    <div className="text-center mb-4 text-gray-600">
                        Saving order details...
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