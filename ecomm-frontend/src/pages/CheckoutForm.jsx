import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

export default function CheckoutForm({ amount, onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!stripe || !elements) {
            setLoading(false);
            return;
        }

        try {
            // Create payment intent on backend
            const res = await axios.post(
                'http://localhost:8080/api/payment/create-intent',
                { amount } // rupees
            );

            const clientSecret = res.data.clientSecret;

            const { paymentIntent, error } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                    },
                }
            );

            if (error) {
                setError(error.message);
                return;
            }

            if (paymentIntent && paymentIntent.status === "succeeded") {
                onSuccess();   // call parent AFTER success
            }

        } catch (err) {
            setError('Failed to process payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement className="p-4 border rounded-lg mb-6" />
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 w-full"
            >
                {loading ? 'Processing...' : `Pay ₹${amount.toFixed(2)}`}
            </button>
        </form>
    );
}
