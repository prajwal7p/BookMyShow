import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTheatreById, getScreensByTheatre, getSeatsByScreen } from '../services/theatreService';

export default function TheatreDetail() {
    const { id } = useParams();
    const [theatre, setTheatre] = useState(null);
    const [screens, setScreens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedScreen, setExpandedScreen] = useState(null);
    const [seatsByScreen, setSeatsByScreen] = useState({});

    useEffect(() => { fetchData(); }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [theatreRes, screensRes] = await Promise.all([
                getTheatreById(id),
                getScreensByTheatre(id)
            ]);
            setTheatre(theatreRes.data.data || theatreRes.data);
            setScreens(screensRes.data.data || screensRes.data || []);
        } catch {
            setError('Failed to load theatre details.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSeats = async (screenId) => {
        if (expandedScreen === screenId) { setExpandedScreen(null); return; }
        setExpandedScreen(screenId);
        if (!seatsByScreen[screenId]) {
            try {
                const res = await getSeatsByScreen(screenId);
                setSeatsByScreen(prev => ({ ...prev, [screenId]: res.data.data || res.data || [] }));
            } catch {
                setSeatsByScreen(prev => ({ ...prev, [screenId]: [] }));
            }
        }
    };

    const seatClass = (type) => {
        if (type === 'VIP') return 'bg-warning text-dark';
        if (type === 'Premium') return 'bg-info text-dark';
        return 'bg-secondary text-white';
    };

    const groupedRows = (seats = []) => {
        const map = {};
        seats.forEach((seat) => {
            const row = seat.seatNumber?.match(/^[A-Za-z]+/)?.[0] || 'X';
            if (!map[row]) map[row] = [];
            map[row].push(seat);
        });
        return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
    };

    if (loading) return <div className="container mt-4"></div>;
    if (!theatre) return <div className="container mt-5 text-danger">Theatre not found.</div>;

    return (
        <div className="container mt-4">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-4">
                {theatre.imageUrl && (
                    <img
                        src={theatre.imageUrl}
                        alt={theatre.name}
                        className="mb-3"
                        style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 16 }}
                    />
                )}
                <h2 className="page-title mb-1">{theatre.name}</h2>
                <p className="text-muted">📍 {theatre.city}{theatre.location ? ` — ${theatre.location}` : ''}</p>
            </div>

            <h4>Screens ({screens.length})</h4>

            {screens.length === 0 ? (
                <p className="text-muted">No screens available.</p>
            ) : (
                screens.map((screen) => (
                    <div className="card mb-3 shadow-sm" key={screen._id}>
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="mb-0">{screen.screenName}</h6>
                                <small className="text-muted">Total Seats: {screen.totalSeats}</small>
                            </div>
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => toggleSeats(screen._id)}>
                                {expandedScreen === screen._id ? 'Hide Seats' : 'View Seats'}
                            </button>
                        </div>

                        {expandedScreen === screen._id && (
                            <div className="card-footer">
                                {(seatsByScreen[screen._id] || []).length === 0 ? (
                                    <p className="text-muted mb-0 small">No seats configured for this screen.</p>
                                ) : (
                                    <div>
                                        <div className="text-center mb-3">
                                            <div style={{ width: '75%', margin: '0 auto', background: '#d8dee8', color: '#5b6578', borderRadius: 999, padding: '0.35rem 0.75rem', fontSize: 12, fontWeight: 700, letterSpacing: 3 }}>
                                                SCREEN
                                            </div>
                                        </div>

                                        {groupedRows(seatsByScreen[screen._id] || []).map(([row, rowSeats]) => (
                                            <div key={row} className="d-flex align-items-center justify-content-center mb-2 gap-2">
                                                <span className="text-muted small fw-bold" style={{ width: 24 }}>{row}</span>
                                                <div className="d-flex flex-wrap gap-1 justify-content-center">
                                                    {rowSeats
                                                        .slice()
                                                        .sort((a, b) => a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true }))
                                                        .map((seat) => (
                                                            <span
                                                                key={seat._id}
                                                                className={`badge ${seatClass(seat.seatType)}`}
                                                                style={{ minWidth: 44, padding: '0.45rem 0.35rem', borderRadius: 8 }}
                                                                title={`${seat.seatNumber} - ${seat.seatType}`}
                                                            >
                                                                {seat.seatNumber}
                                                            </span>
                                                        ))}
                                                </div>
                                            </div>
                                        ))}

                                        <div className="d-flex gap-3 mt-3 flex-wrap justify-content-center small">
                                            <span><span className="badge bg-secondary me-1">A1</span> Regular</span>
                                            <span><span className="badge bg-info text-dark me-1">B1</span> Premium</span>
                                            <span><span className="badge bg-warning text-dark me-1">C1</span> VIP</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
