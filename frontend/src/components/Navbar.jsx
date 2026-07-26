import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUser, logout } from '../services/authService';

export default function Navbar() {
    const navigate = useNavigate();
    const user = getUser();
    const isAdmin = user?.role === 'Admin';
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.dataset.bsTheme = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleTheme = () => {
        setTheme(current => current === 'dark' ? 'light' : 'dark');
    };

    return (
        <nav className='navbar rbms-nav px-4'>
            <Link className='navbar-brand' to={user ? "/movies" : "/"}>
                Cine<span className='rbms-brand-dot'>Hive</span>
            </Link>
            <div className='d-flex align-items-center gap-3'>
                <label className='rbms-theme-toggle' title='Toggle dark theme'>
                    <input
                        type='checkbox'
                        checked={theme === 'dark'}
                        onChange={toggleTheme}
                        aria-label='Toggle dark theme'
                    />
                    <span className='rbms-theme-toggle__track'>
                        <span className='rbms-theme-toggle__thumb' />
                    </span>
                    <span className='rbms-theme-toggle__label'>
                        {theme === 'dark' ? 'Dark' : 'Light'}
                    </span>
                </label>
                {user ? (
                    <>
                        <Link className='rbms-nav-link' to="/movies">Movies</Link>

                        {isAdmin && (
                            <Link className='rbms-nav-link' to="/admin/show/create">
                                Admin Panel
                            </Link>
                        )}
                        {isAdmin && (
                            <Link className='rbms-nav-link' to="/reports">
                                Reports
                            </Link>
                        )}

                        {!isAdmin && (
                            <Link className='rbms-nav-link' to="/theatres">Theatres</Link>
                        )}
                        {!isAdmin && (
                            <Link className='rbms-nav-link' to="/bookings">My Bookings</Link>
                        )}
                        {!isAdmin && (
                            <Link className='rbms-nav-link' to="/reports">
                                Notifications
                            </Link>
                        )}

                        <span className='rbms-user-pill'>Hi, {user.name} ({user.role})</span>
                        <button className='btn btn-sm btn-danger' onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link className='rbms-nav-link' to="/login">Login</Link>
                        <Link className='btn btn-sm btn-danger' to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    )
}
