import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById } from "../services/movieService";
import { getShows } from "../services/showService";


function MovieDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState('all');
  const [movieLoading, setMovieLoading] = useState(true);
  const [showsLoading, setShowsLoading] = useState(true);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingLimit = new Date(today);
  bookingLimit.setDate(bookingLimit.getDate() + 30);

  const getDateKey = (dateValue) => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const todayDate = getDateKey(today);
  const maxBookingDate = getDateKey(bookingLimit);

  useEffect(() => {
    fetchMovie();
    fetchShows();
  }, []);

  // ───────── Fetch Movie ─────────
  const fetchMovie = async () => {
    try {

      const data = await getMovieById(id);
      setMovie(data.data || data);

    } catch (error) {

      console.error("Error fetching movie:", error);

    } finally {

      setMovieLoading(false);

    }
  };

  // ───────── Fetch Shows ─────────
  const fetchShows = async () => {

    try {

      const res = await getShows();
      const allShows = res.data || res || [];

      const filteredShows = allShows.filter(
        show => {
          const showDate = new Date(show.showDate);
          showDate.setHours(0, 0, 0, 0);

          return show.status === "Active" &&
            showDate >= today &&
            showDate <= bookingLimit &&
            (show.movieId?._id === id || show.movieId === id);
        }
      );

      setShows(filteredShows.sort((a, b) => (
        new Date(a.showDate) - new Date(b.showDate) ||
        String(a.showTime).localeCompare(String(b.showTime))
      )));

    } catch (error) {

      console.error("Error fetching shows:", error);

    } finally {

      setShowsLoading(false);

    }
  };

  // ───────── Group Shows By Theatre ─────────
  const groupShowsByTheatre = (showList) => {

    const grouped = {};

    showList.forEach(show => {

      const theatre =
        show.screenId?.theatreId?.name || "Unknown Theatre";

      if (!grouped[theatre]) {
        grouped[theatre] = [];
      }

      grouped[theatre].push(show);

    });

    return grouped;
  };

  const getPriceLabel = (p) => {
    if (!p) return '';
    if (typeof p === 'number') return `₹${p}`;
    const vals = [p.Regular, p.Premium, p.VIP].filter(v => v > 0);
    if (!vals.length) return '';
    const min = Math.min(...vals), max = Math.max(...vals);
    return min === max ? `₹${min}` : `₹${min} – ₹${max}`;
  };

  if (!movie && !movieLoading)
    return <div className="container mt-5">Movie not found.</div>;

  const dateOptions = [...new Set(shows.map(show => getDateKey(show.showDate)))];
  const visibleShows = selectedDate === 'all'
    ? shows
    : shows.filter(show => getDateKey(show.showDate) === selectedDate);
  const groupedShows = groupShowsByTheatre(visibleShows);

  return (

    <div className="container mt-4">

      {/* Movie Info */}

      <h2 className="page-title mb-2">{movie?.title || 'Movie Details'}</h2>

      <div className="row g-4 align-items-start">
        <div className="col-md-4">
          {movie?.imageUrl ? (
            <img
              src={movie.imageUrl}
              alt={movie.title}
              style={{ width: '100%', borderRadius: 14, objectFit: 'cover', maxHeight: 430 }}
            />
          ) : (
            <div className="card p-4 text-center text-muted">No poster added</div>
          )}
        </div>
        <div className="col-md-8">
          <p>
            <strong>Language:</strong> {movie?.language || ''}
          </p>

          <p>
            <strong>Genre:</strong> {movie?.genre?.join(", ") || ''}
          </p>

          <p>
            <strong>Duration:</strong> {movie?.duration || ''} minutes
          </p>

          <p>
            <strong>Rating:</strong> {movie?.rating || ''}
          </p>

          <hr />

          <h5>Description</h5>
          <p>{movie?.description || ''}</p>
        </div>
      </div>

      <hr />

      {/* Shows */}

      <h4 className="mt-4">Available Shows</h4>

      {showsLoading ? null : shows.length === 0 ? (

        <div className="alert alert-warning">
          No shows available for this movie.
        </div>

      ) : (
        <>
          <div className="d-flex gap-2 flex-wrap mb-3">
            <input
              type="date"
              className="form-control form-control-sm"
              style={{ width: 170 }}
              min={todayDate}
              max={maxBookingDate}
              value={selectedDate === 'all' ? '' : selectedDate}
              onChange={(e) => setSelectedDate(e.target.value || 'all')}
            />
            <button
              className={`btn btn-sm ${selectedDate === 'all' ? 'btn-danger' : 'btn-outline-primary'}`}
              onClick={() => setSelectedDate('all')}
            >
              All Upcoming
            </button>
            {dateOptions.map(date => (
              <button
                key={date}
                className={`btn btn-sm ${selectedDate === date ? 'btn-danger' : 'btn-outline-primary'}`}
                onClick={() => setSelectedDate(date)}
              >
                {new Date(date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}
              </button>
            ))}
          </div>

          {Object.keys(groupedShows).map(theatre => (

          <div key={theatre} className="card mb-3">

            <div className="card-header">
              <strong>{theatre}</strong>
            </div>

            <div className="card-body">

              {groupedShows[theatre].map(show => (

                <div
                  key={show._id}
                  className="d-flex justify-content-between align-items-center border-bottom py-2"
                >

                  <div>

                    <div>
                      📅 {new Date(show.showDate).toLocaleDateString("en-GB")}
                    </div>

                    <div>
                      🕐 {show.showTime}
                    </div>

                    <div>
                      🎬 Screen: {show.screenId?.screenName}
                    </div>

                    <div>
                      📍 City: {show.screenId?.theatreId?.city}
                    </div>
                    <div>
                      📍 Location: {show.screenId?.theatreId?.location}
                    </div>
                    <div>
                      💰 Price: {getPriceLabel(show.ticketPrice)}
                    </div>

                    <div>
                      🪑 Available Seats:
                      <strong>
                        {" "}
                        {show.screenId?.totalSeats || 0}
                      </strong>
                    </div>

                  </div>

                  {/* Book Button */}

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      navigate(`/booking?showId=${show._id}`)
                    }
                  >
                    Book
                  </button>

                </div>

              ))}

            </div>

          </div>

          ))}

          {visibleShows.length === 0 && (
            <div className="alert alert-warning">No shows available for this date.</div>
          )}
        </>

      )}

    </div>

  );
}

export default MovieDetails;
