import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMovies } from "../services/movieService";
import { getShows } from "../services/showService";

function MovieList() {

  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [showsLoading, setShowsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedShows, setSelectedShows] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
    fetchShows();
  }, []);

  // ───── Fetch Movies ─────
  const fetchMovies = async () => {
    setMoviesLoading(true);
    setLoadError('');
    try {
      const data = await getMovies({ limit: 1000 });
      setMovies(data.data || []);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setLoadError('Failed to load movies.');
    } finally {
      setMoviesLoading(false);
    }
  };

  // ───── Fetch Shows + Seat Availability ─────
  const fetchShows = async () => {

    setShowsLoading(true);
    setLoadError('');
    try {

      const res = await getShows();
      const allShows = res.data || res || [];
      setShows(allShows);

    } catch (err) {
      console.error("Error fetching shows:", err);
      setLoadError('Failed to load shows.');
    } finally {
      setShowsLoading(false);
    }
  };

  // ───── Get shows for movie ─────
  const getMovieShows = (movieId) => {

    return shows.filter(
      (show) =>
        (show.movieId?._id === movieId || show.movieId === movieId) &&
        show.status === "Active"
    );

  };

  // ───── Open modal ─────
  const openShows = (movie) => {

    const movieShows = getMovieShows(movie._id);

    setSelectedShows(movieShows);
    setSelectedMovie(movie);

  };

  const getPriceLabel = (p) => {
    if (!p) return '';
    if (typeof p === 'number') return `₹${p}`;
    const vals = [p.Regular, p.Premium, p.VIP].filter(v => v > 0);
    if (!vals.length) return '';
    const min = Math.min(...vals), max = Math.max(...vals);
    return min === max ? `₹${min}` : `₹${min} – ₹${max}`;
  };

  // ───── Close modal ─────
  const closeModal = () => {

    setSelectedMovie(null);
    setSelectedShows([]);

  };

  return (

    <div className="container mt-4">

      <h2 className="page-title">Now Showing</h2>

      {loadError && <div className="alert alert-danger">{loadError}</div>}

      {!moviesLoading && movies.length === 0 ? (
        <div className="alert alert-warning">No movies available.</div>
      ) : null}

      <div className="row">

        {!moviesLoading && movies.map((movie) => {

          const movieShows = getMovieShows(movie._id);

          return (

            <div key={movie._id} className="col-md-4 mb-4">

              <div className="card p-3 shadow-sm h-100 cine-hover-card">

                {movie.imageUrl && (
                  <img
                    src={movie.imageUrl}
                    alt={movie.title}
                    className="mb-3"
                    style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 12 }}
                  />
                )}

                <div className="cine-hover-card__overlay">
                  <h5>{movie.title}</h5>
                  <p>{movie.description || 'Movie details, show timings, and booking options are ready.'}</p>
                  <div className="cine-hover-card__meta">
                    <span>{movie.language || 'Movie'}</span>
                    <span>{movie.duration ? `${movie.duration} min` : 'Now showing'}</span>
                    <span>{movie.rating ? `${movie.rating}/10` : 'Rated'}</span>
                  </div>
                  <button
                    className="btn btn-light btn-sm"
                    onClick={() => navigate(`/movies/${movie._id}`)}
                  >
                    View Details
                  </button>
                </div>

                <h5>{movie.title}</h5>

                <p>
                  <strong>Language:</strong> {movie.language}
                </p>

                <p>
                  <strong>Rating:</strong> {movie.rating}
                </p>

                {/* View Details */}

                <button
                  className="btn btn-primary mb-2"
                  onClick={() => navigate(`/movies/${movie._id}`)}
                >
                  View Details
                </button>

                {/* Shows Button */}

                {showsLoading ? null : movieShows.length > 0 ? (

                  <button
                    className="btn btn-success"
                    onClick={() => openShows(movie)}
                  >
                    {movieShows.length} Shows Available
                  </button>

                ) : (

                  <p className="text-danger fw-bold">
                    No Shows Available
                  </p>

                )}

              </div>

            </div>

          );

        })}

      </div>

      {/* SHOW LIST MODAL */}

      {selectedMovie && (

        <div
          className="modal d-block"
          style={{ background: "rgba(9, 13, 28, 0.58)", backdropFilter: "blur(3px)" }}
        >

          <div className="modal-dialog modal-lg">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title">
                  Shows for {selectedMovie.title}
                </h5>

                <button
                  className="btn-close"
                  onClick={closeModal}
                ></button>

              </div>

              <div className="modal-body">

                {selectedShows.length === 0 ? (

                  <p className="text-danger">
                    No shows available
                  </p>

                ) : (

                  <table className="table table-bordered">

                    <thead>

                      <tr>
                        <th>Theatre</th>
                        <th>Location</th>
                        <th>Screen</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Price</th>
                        <th>Seats</th>
                        <th>Action</th>
                      </tr>

                    </thead>

                    <tbody>

                      {selectedShows.map((show) => (

                        <tr key={show._id}>

                          <td>
                            {show.screenId?.theatreId?.name}
                          </td>

                          <td>
                            {show.screenId?.theatreId?.city}
                          </td>

                          <td>
                            {show.screenId?.screenName}
                          </td>

                          <td>
                            {new Date(show.showDate)
                              .toLocaleDateString("en-GB")}
                          </td>

                          <td>
                            {show.showTime}
                          </td>

                          <td>
                            {getPriceLabel(show.ticketPrice)}
                          </td>

                          <td>
                            {show.screenId?.totalSeats || 0}
                          </td>

                          <td>

                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() =>
                                navigate(`/booking?showId=${show._id}`)
                              }
                            >
                              Book
                            </button>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                )}

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

export default MovieList;
