import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getToken } from '../services/authService';
import apiClient from '../services/apiClient';


export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (getToken()) {
            navigate('/movies');
        }
    }, [navigate]);

    const handleFetchQuestion = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await apiClient.get('/auth/security-question', { params: { email } });
            setQuestion(data.securityQuestion || 'No question set for this account');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.msg || 'Email not found');
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await apiClient.post('/auth/forgot-password', { email, securityAnswer: answer, newPassword });
            setMsg(data.msg);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.msg || 'Reset failed');
        }
    };

    return (
        <div className='auth-shell'>
            <div className='card auth-card'>
                <h4 className='auth-title'>Forgot Password</h4>

                {/* Step 1 — Enter Email */}
                {step === 1 && (
                    <form onSubmit={handleFetchQuestion}>
                        {error && <div className='alert alert-danger py-2'>{error}</div>}
                        <input className='form-control mb-3' placeholder='Enter your email' type='email'
                            value={email} onChange={e => setEmail(e.target.value)} required />
                        <button className='btn btn-danger w-100' type='submit'>Get Security Question</button>
                    </form>
                )}

                {/* Step 2 — Answer + New Password */}
                {step === 2 && (
                    <form onSubmit={handleReset}>
                        {error && <div className='alert alert-danger py-2'>{error}</div>}
                        <div className='alert alert-secondary py-2 mb-3'>
                            <small><strong>Q:</strong> {question}</small>
                        </div>
                        <input className='form-control mb-2' placeholder='Your answer'
                            value={answer} onChange={e => setAnswer(e.target.value)} required />
                        <input className='form-control mb-3' placeholder='New password' type='password'
                            value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                        <button className='btn btn-danger w-100' type='submit'>Reset Password</button>
                    </form>
                )}

                {/* Step 3 — Success */}
                {step === 3 && (
                    <div className='text-center'>
                        <div className='alert alert-success'>{msg}</div>
                        <Link to='/login' className='btn btn-outline-danger w-100'>Back to Login</Link>
                    </div>
                )}

                {step !== 3 && (
                    <p className='text-center mt-3 mb-0 text-muted'>
                        <Link to='/login'>Back to Login</Link>
                    </p>
                )}
            </div>
        </div>
    );
}
