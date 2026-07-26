import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, saveToken } from '../services/authService';

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '', email: '', password: '', role: 'Customer',
        securityQuestion: '', securityAnswer: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await register(form);
            saveToken(data.token, data.user);
            navigate('/movies');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
        }
    };

    return (
        <div className='auth-shell py-4'>
            <div className='card auth-card'>
                <h4 className='auth-title'>Create Account</h4>
                {error && <div className='alert alert-danger py-2'>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input className='form-control mb-2' placeholder="Full Name"
                        value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    <input className="form-control mb-2" placeholder="Email" type="email"
                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    <input className="form-control mb-2" placeholder="Password" type="password"
                        value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    <select className='form-select mb-2' value={form.role}
                        onChange={e => setForm({ ...form, role: e.target.value })}>
                        <option value="Customer">Customer</option>
                        <option value="Admin">Admin</option>
                    </select>

                    <hr className='my-2' />
                    <small className='text-muted'>Security Question for password recovery</small>
                    <input className='form-control mb-2 mt-1' placeholder="e.g. What is your pet's name?"
                        value={form.securityQuestion} onChange={e => setForm({ ...form, securityQuestion: e.target.value })} />
                    <input className='form-control mb-3' placeholder="Your answer"
                        value={form.securityAnswer} onChange={e => setForm({ ...form, securityAnswer: e.target.value })} />

                    <button className='btn btn-danger w-100' type='submit'>Register</button>
                </form>
                <p className='text-center mt-3 mb-0 text-muted'>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}
