import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function OrderHistory() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        axios.get(`http://localhost:8080/api/orders/user/${user.id}`)
            .then(res => {
                setOrders(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [user?.id]);

    if (loading) return <div className="text-center py-20">Loading order history...</div>;

    if (orders.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-3xl font-bold mb-6">No Orders Yet</h2>
                <p className="text-xl text-gray-600">Start shopping to see your order history!</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <h1 className="text-4xl font-bold mb-10 text-center">Order History</h1>

            <div className="space-y-8">
                {orders.map(order => (
                    <div key={order.id} className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex justify-between mb-4">
                            <div>
                                <p className="font-bold text-lg">Order ID: {order.orderId}</p>
                                <p className="text-sm text-gray-600">
                                    {new Date(order.orderDate).toLocaleString()}
                                </p>
                            </div>
                            <p className="text-xl font-bold text-green-600">
                                ₹{order.totalAmount.toFixed(2)}
                            </p>
                        </div>

                        <div className="space-y-3 border-t pt-4">
                            {order.items.map(item => (
                                <div key={item.productId} className="flex justify-between text-sm">
                                    <span>{item.name} × {item.quantity}</span>
                                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <p className="mt-4 text-right font-medium text-gray-800">
                            Status: <span className="text-green-600 font-semibold">{order.status}</span>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}