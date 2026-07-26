import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, saveToken } from '../services/authService';

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await login(form);
            saveToken(data.token, data.user);
            navigate('/movies');
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed');
        }
    };

    return (
        <div className='auth-shell'>
            <div className='card auth-card'>
                <h4 className='auth-title'>Welcome Back</h4>
                {error && <div className='alert alert-danger py-2'>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input className="form-control mb-2" placeholder='Email' type="email"
                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    <input className='form-control mb-2' placeholder='Password' type='password'
                        value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    <button className='btn btn-danger w-100 mt-1' type='submit'>Login</button>
                </form>
                <p className='text-center mt-3 mb-0 text-muted'>
                    New user? <Link to="/register">Register here</Link>
                    {' | '}<Link to="/forgot-password">Forgot Password?</Link>
                </p>
            </div>
        </div>
    );
}
