import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddressForm({ onSubmit }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        mobile: '',
        pincode: '',
        flat: '',
        area: '',
        landmark: '',
        city: '',
        state: '',
        addressType: 'Home',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.mobile.match(/^\d{10}$/)) newErrors.mobile = 'Enter valid 10-digit mobile number';
        if (!formData.pincode.match(/^\d{6}$/)) newErrors.pincode = 'Enter valid 6-digit pincode';
        if (!formData.flat.trim()) newErrors.flat = 'Flat/House No. is required';
        if (!formData.area.trim()) newErrors.area = 'Area/Street is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Save to localStorage (demo) or send to backend
            localStorage.setItem('deliveryAddress', JSON.stringify(formData));

            if (onSubmit) {
                onSubmit(formData);
            } else {
                // Default: go to payment or success page
                navigate('/payment-success');
            }
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">Delivery Address</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter your full name"
                    />
                    {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                    <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        maxLength="10"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="10-digit mobile number"
                    />
                    {errors.mobile && <p className="text-red-600 text-sm mt-1">{errors.mobile}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        maxLength="6"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="6-digit pincode"
                    />
                    {errors.pincode && <p className="text-red-600 text-sm mt-1">{errors.pincode}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Flat, House No., Building *</label>
                        <input
                            type="text"
                            name="flat"
                            value={formData.flat}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Flat/House No., Building Name"
                        />
                        {errors.flat && <p className="text-red-600 text-sm mt-1">{errors.flat}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area, Street, Village *</label>
                        <input
                            type="text"
                            name="area"
                            value={formData.area}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Area, Street, Village"
                        />
                        {errors.area && <p className="text-red-600 text-sm mt-1">{errors.area}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (optional)</label>
                    <input
                        type="text"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Any nearby landmark"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City/District *</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="City or District"
                        />
                        {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                        <select
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Select State</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                            {/* Add more states as needed */}
                        </select>
                        {errors.state && <p className="text-red-600 text-sm mt-1">{errors.state}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                    <div className="flex gap-6">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="addressType"
                                value="Home"
                                checked={formData.addressType === 'Home'}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            Home
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="addressType"
                                value="Work"
                                checked={formData.addressType === 'Work'}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            Work
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="addressType"
                                value="Other"
                                checked={formData.addressType === 'Other'}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            Other
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 mt-6"
                >
                    {loading ? 'Saving...' : 'Save Address & Proceed'}
                </button>
            </form>
        </div>
    );
}