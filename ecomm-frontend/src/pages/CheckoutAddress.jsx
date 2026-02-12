import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from "react-router-dom";
export default function CheckoutAddress() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const amount = location.state?.amount;

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        pincode: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        landmark: '',
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.phone || !formData.pincode || !formData.addressLine1 || !formData.city || !formData.state) {
            setError("Please fill all required fields");
            return;
        }

        // Save address temporarily for this checkout session
        localStorage.setItem("deliveryAddress", JSON.stringify(formData));

        // Proceed to payment
        navigate("/checkout/payment", {
            state: {
                amount: amount,
            },
        });
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center">Delivery Address</h1>

            {error && <p className="text-red-600 mb-6 text-center">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 rounded-xl shadow-lg">
                <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name *" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number *" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode *" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                <input name="addressLine1" value={formData.addressLine1} onChange={handleChange} placeholder="Flat / House No., Building Name *" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                <input name="addressLine2" value={formData.addressLine2} onChange={handleChange} placeholder="Area, Street, Village (optional)" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <div className="grid grid-cols-2 gap-4">
                    <input name="city" value={formData.city} onChange={handleChange} placeholder="City / District *" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    <input name="state" value={formData.state} onChange={handleChange} placeholder="State *" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <input name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Landmark (optional)" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />

                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition mt-6"
                >
                    Save Address & Proceed to Payment
                </button>
            </form>
        </div>
    );
}