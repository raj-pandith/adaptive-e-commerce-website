// src/components/CheckoutForm.jsx
import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function CheckoutForm({ amount = 0, onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            setError('Stripe is not loaded. Please refresh the page.');
            return;
        }

        if (amount <= 0) {
            setError('Invalid amount');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Step 1: Create PaymentIntent on backend
            const { data } = await axios.post(
                'http://localhost:8080/api/payment/create-intent',
                {
                    amount,
                    userId: user?.id,
                }
            );

            const { clientSecret } = data;

            if (!clientSecret) {
                throw new Error('No client secret received');
            }

            // Step 2: Confirm payment with Stripe
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: user?.username || 'Customer',
                        email: user?.email || '',
                    },
                },
            });

            if (stripeError) {
                setError(stripeError.message);
                console.error('Stripe error:', stripeError);
                return;
            }

            if (paymentIntent?.status === 'succeeded') {
                console.log('Payment succeeded!', paymentIntent);
                onSuccess?.(); // Call parent success handler (clear cart, navigate, etc.)
            } else {
                setError('Payment processing failed');
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'Something went wrong. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Amount Display */}
            <div className="text-center">
                <p className="text-lg font-medium text-gray-700">Amount to Pay</p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                    ₹{Number(amount).toFixed(2)}
                </p>
            </div>

            {/* Card Input */}
            <div className="p-4 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-indigo-500 transition">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#32325d',
                                '::placeholder': { color: '#aab7c4' },
                            },
                            invalid: {
                                color: '#fa755a',
                            },
                        },
                    }}
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
                    {error}
                </div>
            )}

            {/* Pay Button */}
            <button
                type="submit"
                disabled={!stripe || loading || amount <= 0}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3
          ${loading || !stripe || amount <= 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl active:scale-98'}
        `}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                    </>
                ) : (
                    `Pay ₹${Number(amount).toFixed(2)}`
                )}
            </button>

            {/* Security Note */}
            <p className="text-center text-sm text-gray-500 mt-4">
                Secured by Stripe • Your card details are safe
            </p>
        </form>
    );
}