import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllTheatres, createTheatre, deleteTheatre } from '../services/theatreService';
import { getUser } from '../services/authService';

export default function TheatreList() {
    const [theatres, setTheatres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cityFilter, setCityFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', city: '', location: '' });
    const [error, setError] = useState('');

    const user = getUser();
    const isAdmin = user?.role === 'Admin';
    const navigate = useNavigate();

    useEffect(() => { fetchTheatres(); }, [cityFilter]);

    const fetchTheatres = async () => {
        setLoading(true);
        try {
            const res = await getAllTheatres(cityFilter);
            setTheatres(res.data.data || []);
        } catch {
            setError('Failed to load theatres.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createTheatre(form);
            setForm({ name: '', city: '', location: '' });
            setShowForm(false);
            fetchTheatres();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create theatre.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this theatre? All its screens and seats will also be deleted.')) return;
        try {
            await deleteTheatre(id);
            fetchTheatres();
        } catch {
            setError('Failed to delete theatre.');
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="page-title mb-0">Theatres</h2>
                {isAdmin && (
                    <button className="btn btn-danger" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Add Theatre'}
                    </button>
                )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Filter by city */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <input
                        className="form-control"
                        placeholder="Filter by city..."
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                    />
                </div>
            </div>

            {/* Admin Create Form */}
            {isAdmin && showForm && (
                <form onSubmit={handleCreate} className="card p-4 mb-4 shadow-sm">
                    <h5>Create Theatre</h5>
                    <input className="form-control mb-2" placeholder="Theatre Name" required
                        value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <input className="form-control mb-2" placeholder="City" required
                        value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                    <input className="form-control mb-2" placeholder="Location / Address"
                        value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                    <button className="btn btn-success" type="submit">Create</button>
                </form>
            )}

            {/* Theatre Cards */}
            {loading ? null : theatres.length === 0 ? (
                <p className="text-muted">No theatres found{cityFilter ? ` in "${cityFilter}"` : ''}.</p>
            ) : (
                <div className="row">
                    {theatres.map((theatre) => (
                        <div className="col-md-4 mb-4" key={theatre._id}>
                            <div className="card h-100 shadow-sm cine-hover-card cine-hover-card--theatre">
                                {theatre.imageUrl && (
                                    <img
                                        src={theatre.imageUrl}
                                        alt={theatre.name}
                                        style={{ width: '100%', height: 180, objectFit: 'cover', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                                    />
                                )}
                                <div className="cine-hover-card__overlay">
                                    <h5>{theatre.name}</h5>
                                    <p>{theatre.location || 'Cinema screens, seat layouts, and shows available here.'}</p>
                                    <div className="cine-hover-card__meta">
                                        <span>{theatre.city || 'City'}</span>
                                        <span>Screens</span>
                                        <span>Seats</span>
                                    </div>
                                    <Link to={`/theatres/${theatre._id}`} className="btn btn-light btn-sm">
                                        View Details
                                    </Link>
                                </div>
                                <div className="card-body">
                                    <h5 className="card-title">{theatre.name}</h5>
                                    <p className="card-text text-muted mb-1">📍 {theatre.city}</p>
                                    {theatre.location && (
                                        <p className="card-text text-muted small">{theatre.location}</p>
                                    )}
                                </div>
                                <div className="card-footer d-flex justify-content-between">
                                    <Link to={`/theatres/${theatre._id}`} className="btn btn-outline-primary btn-sm">
                                        View Screens
                                    </Link>
                                    {isAdmin && (
                                        <button className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleDelete(theatre._id)}>
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
