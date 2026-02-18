import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';  // make sure path is correct

export default function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const { login } = useAuth();  // ✅ Correct place

    const onSubmit = async (data) => {
        try {
            const res = await axios.post('http://localhost:8080/api/auth/login', data);

            const token = res.data.token;
            const userData = {
                id: res.data.userId,
                username: res.data.username,
                email: res.data.email || '',
                loyaltyPoints: res.data.loyaltyPoints || 0
            };

            // Clear old data first
            localStorage.clear();

            // Save new data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('userId', userData.id.toString());

            login(userData, token);

            // Temporary admin check — set flag in localStorage
            if (userData.username.toLowerCase() === 'admin') {
                localStorage.setItem('isAdmin', 'true');
            } else {
                localStorage.removeItem('isAdmin');
            }

            // Hard refresh to load fresh state everywhere
            window.location.href = '/';
        } catch (err) {
            alert(err.response?.data || 'Login failed');
        }
    };

    return (
        <div className="min-h-100 flex items-center justify-center">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-96 p-8 bg-white shadow-lg rounded-lg"
            >
                <h2 className="text-2xl font-bold mb-6">Login</h2>

                <input
                    {...register('username', { required: true })}
                    placeholder="Username"
                    className="w-full p-2 mb-2 border rounded"
                />
                {errors.username &&
                    <p className="text-red-500">Username required</p>
                }

                <input
                    {...register('password', { required: true })}
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 mb-4 border rounded"
                />
                {errors.password &&
                    <p className="text-red-500">Password required</p>
                }

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded"
                >
                    Login
                </button>
            </form>
        </div>
    );
}
