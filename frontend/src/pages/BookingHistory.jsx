import { useEffect, useState } from 'react';
import { getUser } from '../services/authService';
import { getMyBookings, cancelBooking } from '../services/bookingService';

export default function BookingHistory() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(null);

    const user = getUser();

    useEffect(() => {
        if (user?.id) fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await getMyBookings(user.id);
            setBookings(res.data.data || res.data || []);
        } catch {
            setError('Failed to load booking history.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Cancel this booking?')) return;
        setCancelling(bookingId);
        try {
            await cancelBooking(bookingId);
            setBookings(prev =>
                prev.map(b => b._id === bookingId ? { ...b, status: 'Cancelled' } : b)
            );
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel booking.');
        } finally {
            setCancelling(null);
        }
    };

    const formatDate = (dateStr) =>
        dateStr ? new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        }) : '—';

    return (
        <div className="container mt-4">
            <h2 className="page-title">My Bookings</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? null : bookings.length === 0 ? (
                <div className="text-center mt-5">
                    <h5 className="text-muted">No bookings yet.</h5>
                    <p className="text-muted">Browse movies and book your first show!</p>
                    <a href="/movies" className="btn btn-danger mt-2">Browse Movies</a>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Movie</th>
                                <th>Show Date</th>
                                <th>Show Time</th>
                                <th>Seats</th>
                                <th>Total Amount</th>
                                <th>Booked On</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking, index) => (
                                <tr key={booking._id}>
                                    <td>{index + 1}</td>
                                    <td className="fw-semibold">
                                        {booking.showId?.movieId?.title || 'Movie unavailable'}
                                    </td>
                                    <td>{formatDate(booking.showId?.showDate)}</td>
                                    <td>{booking.showId?.showTime || '—'}</td>
                                    <td>
                                        {(booking.seats || []).map(s => (
                                            <span key={s} className="badge bg-secondary me-1">{s}</span>
                                        ))}
                                    </td>
                                    <td className="fw-bold text-success">₹{booking.totalAmount}</td>
                                    <td>{formatDate(booking.bookingDate)}</td>
                                    <td>
                                        <span className={`badge ${booking.status === 'Confirmed'
                                            ? 'bg-success' : 'bg-danger'}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td>
                                        {booking.status === 'Confirmed' ? (
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                disabled={cancelling === booking._id}
                                                onClick={() => handleCancel(booking._id)}>
                                                {cancelling === booking._id ? 'Cancelling...' : 'Cancel'}
                                            </button>
                                        ) : (
                                            <span className="text-muted small">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
