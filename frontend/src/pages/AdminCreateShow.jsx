import { useEffect, useState } from 'react';
import {
  getMovies,
  createMovie,
  updateMovie,
  deleteMovie
} from '../services/movieService';
import {
  createShow,
  getShows,
  cancelShow,
  updateShow
} from '../services/showService';
import {
  getAllTheatres,
  getScreensByTheatre,
  createTheatre,
  updateTheatre,
  deleteTheatre,
  addScreenToTheatre,
  deleteScreen,
  getSeatsByScreen,
  addSeats,
  deleteAllSeats
} from '../services/theatreService';
import { getToken } from '../services/authService';

function AdminCreateShow() {

  const [activeTab, setActiveTab] = useState('movie');

  /* ================= MOVIE STATES (UNCHANGED) ================= */

  const [movies, setMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const [search, setSearch] = useState({
    search: '',
    page: 1,
    limit: 5
  });

  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    language: '',
    duration: '',
    rating: '',
    description: '',
    imageUrl: ''
  });

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1
  });

  /* ================= SHOW STATES ================= */

  const [shows, setShows] = useState([]);
  const [selectedMovieForShow, setSelectedMovieForShow] = useState(null);

  const [movieSearchShowTab, setMovieSearchShowTab] = useState('');
  const [showSearch, setShowSearch] = useState('');

  // Theatre → Screen cascade for show creation
  const [theatres, setTheatres] = useState([]);
  const [screenOptions, setScreenOptions] = useState([]);
  const [screenOptionsLoading, setScreenOptionsLoading] = useState(false);
  const [screenOptionsError, setScreenOptionsError] = useState('');
  const [selectedTheatreId, setSelectedTheatreId] = useState('');

  const [showForm, setShowForm] = useState({
    screenId: '',
    showDate: '',
    showTime: '',
    ticketPrice: { Regular: '', Premium: '', VIP: '' }
  });

  const [editingShow, setEditingShow] = useState(null);
  const [editForm, setEditForm] = useState({ showDate: '', showTime: '', ticketPrice: { Regular: '', Premium: '', VIP: '' } });
  const [editingShowId, setEditingShowId] = useState(null);

  /* ================= THEATRE TAB STATES ================= */

  const [theatreList, setTheatreList] = useState([]);
  const [theatreLoading, setTheatreLoading] = useState(false);
  const [selectedTheatreDetail, setSelectedTheatreDetail] = useState(null);
  const [theatreScreens, setTheatreScreens] = useState([]);
  const [expandedScreenId, setExpandedScreenId] = useState(null);
  const [seatsByScreenId, setSeatsByScreenId] = useState({});
  const [configuringScreenId, setConfiguringScreenId] = useState(null);
  const [seatConfig, setSeatConfig] = useState({ rows: '', seatsPerRow: '', seatType: 'Regular' });

  const [showTheatreForm, setShowTheatreForm] = useState(false);
  const [editingTheatreId, setEditingTheatreId] = useState(null);
  const [theatreForm, setTheatreForm] = useState({ name: '', city: '', location: '', imageUrl: '' });

  const [showScreenForm, setShowScreenForm] = useState(false);
  const [screenForm, setScreenForm] = useState({ screenName: '', totalSeats: '' });
  const [theatreError, setTheatreError] = useState('');

  const token = getToken();
  const user = JSON.parse(localStorage.getItem('user'));
  const today = new Date();
  const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  /* ================= FETCH MOVIES ================= */

  useEffect(() => {
    fetchMovies();
  }, [search.page]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const data = await getMovies(search);
      setMovies(data.data || []);
      setPagination({
        total: data.total || 0,
        totalPages: data.totalPages || 1
      });
    } catch {
      alert('Error fetching movies');
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH SHOWS ================= */

  useEffect(() => {
    fetchShows();
    fetchAllMovies();
    fetchTheatres();
  }, []);

  const fetchAllMovies = async () => {
    try {
      const data = await getMovies({ limit: 1000 });
      setAllMovies(data.data || []);
    } catch {
      console.error('Error fetching all movies');
    }
  };

  const fetchTheatres = async () => {
    try {
      const res = await getAllTheatres();
      setTheatres(res.data.data || []);
    } catch (err) {
      console.error('Error fetching theatres:', err);
    }
  };

  const handleTheatreChange = async (theatreId) => {
    setSelectedTheatreId(theatreId);
    setShowForm(f => ({ ...f, screenId: '' }));
    setScreenOptions([]);
    setScreenOptionsError('');
    if (!theatreId) return;
    setScreenOptionsLoading(true);
    try {
      const res = await getScreensByTheatre(theatreId);
      setScreenOptions(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error loading screens:', err);
      setScreenOptionsError(err.response?.data?.message || 'Failed to load screens for this theatre.');
    } finally {
      setScreenOptionsLoading(false);
    }
  };

  // const fetchShows = async () => {
  //   try {
  //     const data = await getShows();
  //     setShows(data.data || []);
  //   } catch {
  //     alert('Error fetching shows');
  //   }
  // };
  const fetchShows = async () => {
    try {
      const res = await getShows();

      console.log("Shows API response:", res);

      setShows(res || []);
    } catch (err) {
      console.error("Error fetching shows:", err);
      alert("Error fetching shows");
    }
  };

  /* ================= MOVIE FUNCTIONS (UNCHANGED) ================= */

  const handleSearch = () => {
    setSearch({ ...search, page: 1 });
    fetchMovies();
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      genre: '',
      language: '',
      duration: '',
      rating: '',
      description: '',
      imageUrl: ''
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const movieData = {
      ...formData,
      genre: formData.genre.split(',').map(g => g.trim())
    };

    try {
      if (editingId) {
        await updateMovie(editingId, movieData);
        alert('Movie updated successfully');
      } else {
        await createMovie(movieData);
        alert('Movie created successfully');
      }

      resetForm();
      fetchMovies();
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  const handleEdit = (movie) => {
    setFormData({
      title: movie.title,
      genre: movie.genre.join(', '),
      language: movie.language,
      duration: movie.duration,
      rating: movie.rating,
      description: movie.description,
      imageUrl: movie.imageUrl || ''
    });
    setEditingId(movie._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    await deleteMovie(id);
    fetchMovies();
  };

  const handleViewDetails = (movie) => {
    setSelectedMovie(movie);
  };

  const changePage = (newPage) => {
    setSearch({ ...search, page: newPage });
  };

  /* ================= SHOW FUNCTIONS ================= */

  const handleCreateShow = async (e) => {
    e.preventDefault();

    try {
      if (showForm.showDate && showForm.showDate < todayDate) {
        alert('Show date cannot be in the past');
        return;
      }

      const payload = {
        movieId: selectedMovieForShow._id,
        ...showForm
      };

      if (editingShowId) {

        // UPDATE SHOW
        await updateShow(editingShowId, payload);
        alert("Show updated successfully");

      } else {

        // CREATE SHOW
        await createShow(payload);
        alert("Show created successfully");

      }

      setEditingShowId(null);

      setShowForm({
        screenId: '',
        showDate: '',
        showTime: '',
        ticketPrice: { Regular: '', Premium: '', VIP: '' }
      });

      setSelectedMovieForShow(null);
      fetchShows();

    } catch (err) {
      alert(err.response?.data?.message || 'Error saving show');
    }
  };
  const handleCancelShow = async (id) => {
    if (!window.confirm('Cancel this show?')) return;
    await cancelShow(id);
    fetchShows();
  };

  const handleEditShow = async (show) => {

    const theatreId = show.screenId?.theatreId?._id || show.screenId?.theatreId;

    setEditingShowId(show._id);   // ⭐ important

    setSelectedMovieForShow(show.movieId);
    setSelectedTheatreId(theatreId);

    try {
      const res = await getScreensByTheatre(theatreId);
      const screens = res.data.data || res.data || [];

      setScreenOptions(screens);

      setShowForm({
        screenId: show.screenId?._id || "",
        showDate: show.showDate ? new Date(show.showDate).toISOString().split('T')[0] : '',
        showTime: show.showTime || '',
        ticketPrice: {
          Regular: show.ticketPrice?.Regular || '',
          Premium: show.ticketPrice?.Premium || '',
          VIP: show.ticketPrice?.VIP || ''
        }
      });

    } catch (err) {
      console.error("Error loading screens:", err);
    }
  };

  /* ================= THEATRE TAB HANDLERS ================= */

  const fetchTheatreList = async () => {
    setTheatreLoading(true);
    try {
      const res = await getAllTheatres();
      setTheatreList(res.data.data || res.data || []);
    } catch {
      setTheatreError('Failed to load theatres.');
    } finally {
      setTheatreLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'theatre') fetchTheatreList();
  }, [activeTab]);

  const handleCreateTheatre = async (e) => {
    e.preventDefault();
    try {
      if (editingTheatreId) {
        await updateTheatre(editingTheatreId, theatreForm);
      } else {
        await createTheatre(theatreForm);
      }
      setTheatreForm({ name: '', city: '', location: '', imageUrl: '' });
      setEditingTheatreId(null);
      setShowTheatreForm(false);
      fetchTheatreList();
      fetchTheatres();
    } catch (err) {
      setTheatreError(err.response?.data?.message || 'Error saving theatre.');
    }
  };

  const handleEditTheatre = (t) => {
    setTheatreForm({ name: t.name, city: t.city, location: t.location || '', imageUrl: t.imageUrl || '' });
    setEditingTheatreId(t._id);
    setShowTheatreForm(true);
  };

  const handleDeleteTheatre = async (id) => {
    if (!window.confirm('Delete this theatre and all its screens?')) return;
    try {
      await deleteTheatre(id);
      if (selectedTheatreDetail?._id === id) setSelectedTheatreDetail(null);
      fetchTheatreList();
    } catch {
      setTheatreError('Failed to delete theatre.');
    }
  };

  const handleSelectTheatreDetail = async (t) => {
    setSelectedTheatreDetail(t);
    setShowScreenForm(false);
    setExpandedScreenId(null);
    setSeatsByScreenId({});
    try {
      const res = await getScreensByTheatre(t._id);
      setTheatreScreens(res.data.data || res.data || []);
    } catch {
      setTheatreError('Failed to load screens.');
    }
  };

  const handleAddScreen = async (e) => {
    e.preventDefault();
    try {
      await addScreenToTheatre(selectedTheatreDetail._id, {
        screenName: screenForm.screenName,
        totalSeats: Number(screenForm.totalSeats)
      });
      setScreenForm({ screenName: '', totalSeats: '' });
      setShowScreenForm(false);
      handleSelectTheatreDetail(selectedTheatreDetail);
      if (selectedTheatreId === selectedTheatreDetail._id) {
        handleTheatreChange(selectedTheatreId);
      }
    } catch (err) {
      setTheatreError(err.response?.data?.message || 'Failed to add screen.');
    }
  };

  const handleDeleteScreen = async (screenId) => {
    if (!window.confirm('Delete this screen and all its seats?')) return;
    try {
      await deleteScreen(screenId);
      handleSelectTheatreDetail(selectedTheatreDetail);
      if (selectedTheatreId === selectedTheatreDetail._id) {
        handleTheatreChange(selectedTheatreId);
      }
    } catch {
      setTheatreError('Failed to delete screen.');
    }
  };

  const toggleSeats = async (screenId) => {
    if (expandedScreenId === screenId) { setExpandedScreenId(null); return; }
    setExpandedScreenId(screenId);
    setConfiguringScreenId(null);
    if (!seatsByScreenId[screenId]) {
      try {
        const res = await getSeatsByScreen(screenId);
        setSeatsByScreenId(prev => ({ ...prev, [screenId]: res.data.data || res.data || [] }));
      } catch {
        setSeatsByScreenId(prev => ({ ...prev, [screenId]: [] }));
      }
    }
  };

  const handleConfigureSeats = async (e, screen) => {
    e.preventDefault();
    const rows = seatConfig.rows.toUpperCase().replace(/\s/g, '').split(',').filter(Boolean);
    const perRow = parseInt(seatConfig.seatsPerRow);
    if (!rows.length || isNaN(perRow) || perRow < 1) { setTheatreError('Enter valid rows and seats per row.'); return; }
    const seats = [];
    rows.forEach(row => { for (let i = 1; i <= perRow; i++) seats.push({ seatNumber: `${row}${i}`, seatType: seatConfig.seatType }); });
    try {
      await addSeats(screen._id, seats);
      const res = await getSeatsByScreen(screen._id);
      setSeatsByScreenId(prev => ({ ...prev, [screen._id]: res.data.data || res.data || [] }));
      setConfiguringScreenId(null);
      setSeatConfig({ rows: '', seatsPerRow: '', seatType: 'Regular' });
    } catch (err) {
      setTheatreError(err.response?.data?.message || 'Failed to add seats.');
    }
  };

  const handleDeleteAllSeats = async (screenId) => {
    if (!window.confirm('Delete ALL seats for this screen?')) return;
    try {
      await deleteAllSeats(screenId);
      setSeatsByScreenId(prev => ({ ...prev, [screenId]: [] }));
    } catch {
      setTheatreError('Failed to delete seats.');
    }
  };

  /* ================= AUTH CHECK ================= */

  if (!token || user?.role !== 'Admin') {
    return (
      <div className="container mt-5 text-center">
        <h4>Access Denied</h4>
        <p className="text-danger">Admins only.</p>
      </div>
    );
  }
  // =================== show model popup=======================

  // const openShowModal = (movie) => {
  //   setSelectedMovieForShow(movie);
  //   setSelectedTheatreId('');
  //   setScreenOptions([]);
  // };

  const openShowModal = (movie) => {
    setEditingShowId(null); // ⭐ reset edit mode

    setSelectedMovieForShow(movie);
    setSelectedTheatreId('');
    setScreenOptions([]);
    setScreenOptionsError('');
    fetchTheatres();

    setShowForm({
      screenId: '',
      showDate: '',
      showTime: '',
      ticketPrice: { Regular: '', Premium: '', VIP: '' }
    });
  };


  // const closeShowModal = () => {
  //   setSelectedMovieForShow(null);
  //   setSelectedTheatreId('');
  //   setScreenOptions([]);
  //   setShowForm({ screenId: '', showDate: '', showTime: '', ticketPrice: '' });
  // };

  const closeShowModal = () => {
    setEditingShowId(null);

    setSelectedMovieForShow(null);
    setSelectedTheatreId('');
    setScreenOptions([]);
    setScreenOptionsError('');

    setShowForm({
      screenId: '',
      showDate: '',
      showTime: '',
      ticketPrice: { Regular: '', Premium: '', VIP: '' }
    });
  };

  const filteredMoviesForShow = allMovies.filter(movie =>
    movie.title.toLowerCase().includes(movieSearchShowTab.toLowerCase())
  );

  const filteredShows = shows.filter(show => {
    const searchValue = showSearch.toLowerCase();

    const movieTitle = show.movieId?.title?.toLowerCase() || "";
    const theatreName = show.screenId?.theatreId?.name?.toLowerCase() || "";
    const screenName = show.screenId?.screenName?.toLowerCase() || "";
    const showDate = new Date(show.showDate).toLocaleDateString('en-GB').toLowerCase();
    const showTime = show.showTime?.toLowerCase() || "";

    return (
      movieTitle.includes(searchValue) ||
      theatreName.includes(searchValue) ||
      screenName.includes(searchValue) ||
      showDate.includes(searchValue) ||
      showTime.includes(searchValue)
    );
  });

  return (
    <div className="container mt-5">

      <h2>Admin Panel</h2>

      {/* Tabs */}
      <div className="mb-4">
        <button
          className={`btn me-2 ${activeTab === 'movie' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('movie')}
        >
          Movie Management
        </button>

        <button
          className={`btn ${activeTab === 'show' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('show')}
        >
          Show Management
        </button>

        <button
          className={`btn ms-2 ${activeTab === 'theatre' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('theatre')}
        >
          Theatre Management
        </button>
      </div>

      {/* ================= MOVIE TAB (UNCHANGED) ================= */}
      {activeTab === 'movie' && (
        <>
          {/* Search */}
          <div className="card p-3 mb-4">
            <div className="row">
              <div className="col-md-10">
                <input
                  type="text"
                  placeholder="Search by title, language, or genre..."
                  className="form-control"
                  value={search.search}
                  onChange={(e) =>
                    setSearch({ ...search, search: e.target.value })
                  }
                />
              </div>
              <div className="col-md-2">
                <button className="btn btn-primary w-100" onClick={handleSearch}>
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="card p-4 mb-4">
            <h5>{editingId ? 'Update Movie' : 'Create Movie'}</h5>

            <input name="title" placeholder="Title" className="form-control mb-2"
              value={formData.title} onChange={handleFormChange} required />

            <input name="genre" placeholder="Genre (comma separated)"
              className="form-control mb-2"
              value={formData.genre} onChange={handleFormChange} />

            <input name="language" placeholder="Language"
              className="form-control mb-2"
              value={formData.language} onChange={handleFormChange} />

            <input type="number" name="duration" placeholder="Duration"
              className="form-control mb-2"
              value={formData.duration} onChange={handleFormChange} />

            <input type="number" name="rating" placeholder="Rating (0-10)"
              className="form-control mb-2"
              value={formData.rating} onChange={handleFormChange} />

            <input name="imageUrl" placeholder="Movie image URL"
              className="form-control mb-2"
              value={formData.imageUrl} onChange={handleFormChange} />

            <textarea name="description" placeholder="Description"
              className="form-control mb-2"
              value={formData.description} onChange={handleFormChange} />

            <button className="btn btn-success">
              {editingId ? 'Update Movie' : 'Create Movie'}
            </button>
          </form>

          {/* Table */}
          {loading ? null : (
            <>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Poster</th>
                    <th>Title</th>
                    <th>Language</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((movie) => (
                    <tr key={movie._id}>
                      <td>
                        {movie.imageUrl ? (
                          <img src={movie.imageUrl} alt={movie.title} style={{ width: 48, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                        ) : (
                          <span className="text-muted small">No image</span>
                        )}
                      </td>
                      <td>{movie.title}</td>
                      <td>{movie.language}</td>
                      <td>{movie.rating}</td>
                      <td>
                        <button
                          className="btn btn-info btn-sm me-2"
                          onClick={() => handleViewDetails(movie)}
                        >
                          Details
                        </button>

                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleEdit(movie)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(movie._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="d-flex justify-content-center">
                {Array.from({ length: pagination.totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm mx-1 ${search.page === i + 1 ? 'btn-primary' : 'btn-outline-primary'
                      }`}
                    onClick={() => changePage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Details Modal */}
          {selectedMovie && (
            <div className="modal d-block rbms-modal-glass-wrap" onClick={() => setSelectedMovie(null)}>
              <div className="modal-dialog">
                <div className="modal-content rbms-modal-glass-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h5 className="modal-title">Movie Details</h5>
                    <button
                      className="btn-close"
                      onClick={() => setSelectedMovie(null)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {selectedMovie.imageUrl && (
                      <img
                        src={selectedMovie.imageUrl}
                        alt={selectedMovie.title}
                        style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 10 }}
                        className="mb-3"
                      />
                    )}
                    <p><strong>Title:</strong> {selectedMovie.title}</p>
                    <p><strong>Language:</strong> {selectedMovie.language}</p>
                    <p><strong>Genre:</strong> {selectedMovie.genre.join(', ')}</p>
                    <p><strong>Duration:</strong> {selectedMovie.duration} minutes</p>
                    <p><strong>Rating:</strong> {selectedMovie.rating}</p>
                    <p><strong>Description:</strong> {selectedMovie.description}</p>
                    <p><strong>Status:</strong> {selectedMovie.status}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================= SHOW TAB ================= */}
      {/* ================= SHOW TAB ================= */}
      {activeTab === 'show' && (
        <div className="row">

          {/* LEFT COLUMN – MOVIES */}
          <div className="col-md-6">

            <h4>Movies</h4>

            <input
              type="text"
              placeholder="Search movie..."
              className="form-control mb-2"
              value={movieSearchShowTab}
              onChange={(e) => setMovieSearchShowTab(e.target.value)}
            />
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Create Show</th>
                </tr>
              </thead>
              <tbody>
                {filteredMoviesForShow.map(movie => (
                  <tr key={movie._id}>
                    <td>{movie.title}</td>
                    <td>
                      {/* <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openShowModal(movie)}
                      >
                        Create Show
                      </button> */}
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openShowModal(movie)}
                      >
                        Create Show
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RIGHT COLUMN – SHOW LIST */}
          <div className="col-md-6">
            <h4>All Shows</h4>
            <input
              type="text"
              placeholder="Search by movie, theatre, screen, date or time..."
              className="form-control mb-2"
              value={showSearch}
              onChange={(e) => setShowSearch(e.target.value)}
            />
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Movie</th>
                  <th>Theatre</th>
                  <th>Screen</th>
                  <th>Date (dd/mm/yyyy)</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShows.map(show => (
                  <tr key={show._id}>
                    <td>{show.movieId?.title}</td>
                    <td>{show.screenId?.theatreId?.name}</td>
                    <td>{show.screenId?.screenName}</td>
                    <td>{new Date(show.showDate).toLocaleDateString('en-GB')}</td>
                    <td>{show.showTime}</td>
                    <td>{show.status}</td>
                    <td>
                      {show.status === 'Active' && (
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleEditShow(show)}
                        >
                          Edit
                        </button>
                      )}
                      {show.status === 'Active' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancelShow(show._id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ================= THEATRE TAB ================= */}
      {activeTab === 'theatre' && (
        <div className="row g-4">

          {/* LEFT — Theatre List */}
          <div className="col-md-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Theatres</h4>
              <button className="btn btn-danger btn-sm" onClick={() => { setShowTheatreForm(!showTheatreForm); setEditingTheatreId(null); setTheatreForm({ name: '', city: '', location: '', imageUrl: '' }); }}>
                {showTheatreForm && !editingTheatreId ? 'Cancel' : '+ Add Theatre'}
              </button>
            </div>

            {theatreError && <div className="alert alert-danger alert-dismissible py-2">{theatreError}<button className="btn-close" onClick={() => setTheatreError('')}></button></div>}

            {showTheatreForm && (
              <form onSubmit={handleCreateTheatre} className="card p-3 mb-3 shadow-sm">
                <h6>{editingTheatreId ? 'Edit Theatre' : 'New Theatre'}</h6>
                <input className="form-control mb-2" placeholder="Theatre Name" required
                  value={theatreForm.name} onChange={e => setTheatreForm({ ...theatreForm, name: e.target.value })} />
                <input className="form-control mb-2" placeholder="City" required
                  value={theatreForm.city} onChange={e => setTheatreForm({ ...theatreForm, city: e.target.value })} />
                <input className="form-control mb-2" placeholder="Location (optional)"
                  value={theatreForm.location} onChange={e => setTheatreForm({ ...theatreForm, location: e.target.value })} />
                <input className="form-control mb-2" placeholder="Theatre image URL"
                  value={theatreForm.imageUrl} onChange={e => setTheatreForm({ ...theatreForm, imageUrl: e.target.value })} />
                <button className="btn btn-success btn-sm" type="submit">{editingTheatreId ? 'Update' : 'Create'} Theatre</button>
              </form>
            )}

            {theatreLoading ? null : theatreList.length === 0 ? (
              <p className="text-muted">No theatres yet.</p>
            ) : (
              theatreList.map(t => (
                <div key={t._id}
                  className={`card mb-2 shadow-sm ${selectedTheatreDetail?._id === t._id ? 'border-primary' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSelectTheatreDetail(t)}
                >
                  <div className="card-body py-2 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      {t.imageUrl && (
                        <img src={t.imageUrl} alt={t.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8 }} />
                      )}
                      <div>
                        <strong>{t.name}</strong>
                        <div className="text-muted small">{t.city}{t.location ? ` — ${t.location}` : ''}</div>
                      </div>
                    </div>
                    <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
                      <button className="btn btn-warning btn-sm" onClick={() => handleEditTheatre(t)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTheatre(t._id)}>Del</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT — Screens + Seats for selected theatre */}
          <div className="col-md-7">
            {!selectedTheatreDetail ? (
              <div className="text-muted mt-5 text-center">
                <h5>← Select a theatre to manage its screens and seats</h5>
              </div>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">🎬 {selectedTheatreDetail.name} — Screens</h5>
                  <button className="btn btn-success btn-sm" onClick={() => setShowScreenForm(!showScreenForm)}>
                    {showScreenForm ? 'Cancel' : '+ Add Screen'}
                  </button>
                </div>

                {showScreenForm && (
                  <form onSubmit={handleAddScreen} className="card p-3 mb-3 shadow-sm">
                    <h6>New Screen</h6>
                    <input className="form-control mb-2" placeholder="Screen Name (e.g. Screen 1)" required
                      value={screenForm.screenName} onChange={e => setScreenForm({ ...screenForm, screenName: e.target.value })} />
                    <input type="number" className="form-control mb-2" placeholder="Total Seats (e.g. 100)" required
                      value={screenForm.totalSeats} onChange={e => setScreenForm({ ...screenForm, totalSeats: e.target.value })} />
                    <button className="btn btn-success btn-sm" type="submit">Add Screen</button>
                  </form>
                )}

                {theatreScreens.length === 0 ? (
                  <p className="text-muted">No screens added yet.</p>
                ) : (
                  theatreScreens.map(screen => (
                    <div key={screen._id} className="card mb-3 shadow-sm">
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{screen.screenName}</strong>
                          <span className="text-muted small ms-2">({screen.totalSeats} seats)</span>
                        </div>
                        <div className="d-flex gap-2">
                          <button className="btn btn-outline-secondary btn-sm" onClick={() => toggleSeats(screen._id)}>
                            {expandedScreenId === screen._id ? 'Hide Seats' : 'View Seats'}
                          </button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteScreen(screen._id)}>Delete</button>
                        </div>
                      </div>

                      {expandedScreenId === screen._id && (
                        <div className="card-footer">
                          {(seatsByScreenId[screen._id] || []).length === 0 ? (
                            <p className="text-muted small mb-2">No seats configured.</p>
                          ) : (
                            <div className="d-flex flex-wrap gap-1 mb-2">
                              {(seatsByScreenId[screen._id] || []).map(seat => (
                                <span key={seat._id} className={`badge ${seat.seatType === 'VIP' ? 'bg-warning text-dark' :
                                    seat.seatType === 'Premium' ? 'bg-info text-dark' : 'bg-secondary'
                                  }`}>{seat.seatNumber}</span>
                              ))}
                            </div>
                          )}

                          <div className="d-flex gap-2 flex-wrap">
                            <button className="btn btn-sm btn-outline-primary"
                              onClick={() => setConfiguringScreenId(configuringScreenId === screen._id ? null : screen._id)}>
                              {configuringScreenId === screen._id ? 'Cancel' : '⚙ Configure Seats'}
                            </button>
                            {(seatsByScreenId[screen._id] || []).length > 0 && (
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteAllSeats(screen._id)}>
                                🗑 Clear All
                              </button>
                            )}
                          </div>

                          {configuringScreenId === screen._id && (
                            <form onSubmit={e => handleConfigureSeats(e, screen)} className="mt-3 p-3 border rounded bg-light">
                              <h6 className="mb-3">Generate Seats — {screen.screenName}</h6>
                              <div className="row g-2 mb-2">
                                <div className="col-5">
                                  <label className="form-label small">Rows (e.g. A,B,C)</label>
                                  <input className="form-control form-control-sm" placeholder="A,B,C,D"
                                    value={seatConfig.rows}
                                    onChange={e => setSeatConfig({ ...seatConfig, rows: e.target.value })} required />
                                </div>
                                <div className="col-4">
                                  <label className="form-label small">Seats per Row</label>
                                  <input type="number" className="form-control form-control-sm" placeholder="10"
                                    value={seatConfig.seatsPerRow}
                                    onChange={e => setSeatConfig({ ...seatConfig, seatsPerRow: e.target.value })} required />
                                </div>
                                <div className="col-3">
                                  <label className="form-label small">Type</label>
                                  <select className="form-select form-select-sm"
                                    value={seatConfig.seatType}
                                    onChange={e => setSeatConfig({ ...seatConfig, seatType: e.target.value })}>
                                    <option>Regular</option>
                                    <option>Premium</option>
                                    <option>VIP</option>
                                  </select>
                                </div>
                              </div>
                              {seatConfig.rows && seatConfig.seatsPerRow && (
                                <p className="text-muted small mb-2">
                                  Preview: {seatConfig.rows.split(',').filter(Boolean).length * parseInt(seatConfig.seatsPerRow || 0)} seats total
                                </p>
                              )}
                              <button type="submit" className="btn btn-success btn-sm">Add Seats</button>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </>
            )}
          </div>

        </div>
      )}

      {/* ================= SHOW CREATION MODAL ================= */}
      {selectedMovieForShow && (
        <div
          className="modal d-block"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                {/* <h5 className="modal-title">
                  Create Show for: {selectedMovieForShow.title}
                </h5> */}
                <h5 className="modal-title">
                  {editingShowId ? "Edit Show" : "Create Show"} for: {selectedMovieForShow.title}
                </h5>
                <button
                  className="btn-close"
                  onClick={closeShowModal}
                ></button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleCreateShow}>

                  {/* Theatre dropdown */}
                  <label className="form-label small text-muted">Select Theatre</label>
                  <select
                    className="form-select mb-2"
                    value={selectedTheatreId}
                    onChange={(e) => handleTheatreChange(e.target.value)}
                    required>
                    <option value="">-- Choose Theatre --</option>
                    {theatres.map(t => (
                      <option key={t._id} value={t._id}>{t.name} — {t.city}</option>
                    ))}
                  </select>

                  {/* Screen dropdown (loads after theatre selected) */}
                  <label className="form-label small text-muted">Select Screen</label>
                  <select
                    className="form-select mb-2"
                    value={showForm.screenId}
                    onChange={(e) => setShowForm({ ...showForm, screenId: e.target.value })}
                    disabled={!selectedTheatreId || screenOptionsLoading}
                    required>
                    <option value="">
                      {screenOptionsLoading
                        ? 'Loading screens...'
                        : selectedTheatreId
                          ? '-- Choose Screen --'
                          : 'Select a theatre first'}
                    </option>
                    {screenOptions.map(s => (
                      <option key={s._id} value={s._id}>{s.screenName} ({s.totalSeats} seats)</option>
                    ))}
                  </select>
                  {screenOptionsError && (
                    <div className="alert alert-danger py-2 small mb-2">{screenOptionsError}</div>
                  )}
                  {selectedTheatreId && !screenOptionsLoading && !screenOptionsError && screenOptions.length === 0 && (
                    <div className="alert alert-warning py-2 small mb-2">
                      No screens found for this theatre. Add a screen in Theatre Management first.
                    </div>
                  )}

                  <input
                    type="date"
                    className="form-control mb-2"
                    min={todayDate}
                    value={showForm.showDate}
                    onChange={(e) =>
                      setShowForm({ ...showForm, showDate: e.target.value })
                    }
                    required
                  />

                  <input
                    type="time"
                    className="form-control mb-2"
                    value={showForm.showTime}
                    onChange={(e) =>
                      setShowForm({ ...showForm, showTime: e.target.value })
                    }
                    required
                  />

                  <label className="form-label small text-muted">Prices</label>
                  <div className="row g-2 mb-3">
                    {['Regular', 'Premium', 'VIP'].map(type => (
                      <div className="col-4" key={type}>
                        <label className="form-label small">{type} (₹)</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          placeholder={type === 'Regular' ? '150' : type === 'Premium' ? '250' : '400'}
                          value={showForm.ticketPrice[type]}
                          onChange={(e) => setShowForm({ ...showForm, ticketPrice: { ...showForm.ticketPrice, [type]: e.target.value } })}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  {/* <button className="btn btn-success w-100">
                    Create Show
                  </button> */}
                  <button className="btn btn-success w-100">
                    {editingShowId ? "Update Show" : "Create Show"}
                  </button>

                </form>
              </div>

            </div>
          </div>
        </div>
      )}
      {editingShow && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Show: {editingShow.movieId?.title}</h5>
                <button className="btn-close" onClick={closeEditModal}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdateShow}>
                  <label className="form-label small text-muted">Show Date</label>
                  <input
                    type="date"
                    className="form-control mb-2"
                    min={todayDate}
                    value={editForm.showDate}
                    onChange={(e) => setEditForm({ ...editForm, showDate: e.target.value })}
                    required
                  />
                  <label className="form-label small text-muted">Show Time</label>
                  <input
                    type="time"
                    className="form-control mb-2"
                    value={editForm.showTime}
                    onChange={(e) => setEditForm({ ...editForm, showTime: e.target.value })}
                    required
                  />
                  <label className="form-label small text-muted">Prices</label>
                  <div className="row g-2 mb-3">
                    {['Regular', 'Premium', 'VIP'].map(type => (
                      <div className="col-4" key={type}>
                        <label className="form-label small">{type} (₹)</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={editForm.ticketPrice[type] || ''}
                          onChange={(e) => setEditForm({ ...editForm, ticketPrice: { ...editForm.ticketPrice, [type]: e.target.value } })}
                          required
                        />
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-success w-100">Update Show</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCreateShow;
