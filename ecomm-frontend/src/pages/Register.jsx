import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            const response = await axios.post('http://localhost:8080/api/auth/signup', data);
            // alert(response.data);
            navigate('/login');
        } catch (err) {
            alert(err.response?.data || 'Signup failed');
        }
    };

    return (
        <div className="min-h-100 flex items-center justify-center">
            <form onSubmit={handleSubmit(onSubmit)} className="w-96 p-8 bg-white shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold mb-6">Signup</h2>

                <input
                    {...register('username', { required: true })}
                    placeholder="Username"
                    className="w-full p-2 mb-2 border rounded"
                />
                {errors.username && <p className="text-red-500">Username required</p>}

                <input
                    {...register('password', { required: true })}
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 mb-2 border rounded"
                />
                {errors.password && <p className="text-red-500">Password required</p>}

                <input
                    {...register('email', { required: true })}
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 mb-4 border rounded"
                />
                {errors.email && <p className="text-red-500">Email required</p>}

                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Signup</button>
            </form>
        </div>
    );
}