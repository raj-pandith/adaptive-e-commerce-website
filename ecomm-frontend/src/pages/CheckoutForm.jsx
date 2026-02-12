import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../components/axiosInstance.js';

export default function CheckoutForm({ amount, onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Basic validation
        if (amount <= 0) {
            setError('Invalid amount');
            return;
        }

        if (!stripe || !elements) {
            setError('Stripe is not loaded yet. Please refresh the page.');
            return;
        }

        // 2. Check if user is logged in
        if (!user) {
            setError('Please login to continue payment');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Step 1: Create PaymentIntent on backend
            const res = await axios.post(
                'http://localhost:8080/api/payment/create-intent',
                {
                    amount,
                    userId: user.id
                }
            );

            const { clientSecret } = res.data;

            if (!clientSecret) {
                throw new Error('No client secret received from server');
            }

            // Step 2: Confirm payment with Stripe
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: {
                            name: user.username || 'Test User',
                            email: user.email || 'test@example.com',
                        },
                    },
                }
            );

            if (stripeError) {
                setError(stripeError.message);
                console.error('Stripe confirmation error:', stripeError);
                return;
            }

            if (paymentIntent && paymentIntent.status === 'succeeded') {
                console.log('Payment succeeded!', paymentIntent);

                try {
                    // Award points
                    await axiosInstance.post('/api/payment/complete', {
                        userId: user.id,
                        amount
                    });


                    const userRes = await axios.get(`http://localhost:8080/api/users/${user.id}`);
                    updateUser(userRes.data); // This should trigger Navbar useEffect
                    console.log('Just updated context with:', userRes.data.loyaltyPoints);
                    onSuccess();
                } catch (err) {
                    console.error('Post-payment error:', err);
                }
            } else {
                setError('Payment status is not succeeded');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                'Failed to process payment. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 border border-gray-300 rounded-lg bg-white">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#32325d',
                                '::placeholder': { color: '#aab7c4' },
                            },
                            invalid: { color: '#fa755a' },
                        },
                    }}
                />
            </div>

            {error && (
                <div className="text-red-600 text-center font-medium bg-red-50 p-3 rounded-lg">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || loading || !user}
                className={`w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2
          ${loading || !user ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-98'}
        `}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </>
                ) : (
                    `Pay ₹${Number(amount).toFixed(2)}`
                )}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
                Secured by Stripe • No card details stored
            </p>
        </form>
    );
}