import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUser, getToken } from '../services/authService';
import { getMovies } from '../services/movieService';
import { getShows } from '../services/showService';

function formatShow(show) {
  const date = show.showDate ? new Date(show.showDate).toLocaleDateString('en-GB') : 'N/A';
  const theatre = show.screenId?.theatreId?.name || 'Theatre';
  return `${date} | ${show.showTime} | ${theatre}`;
}

export default function BookingAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useMemo(() => getUser(), [location.pathname]);
  const token = getToken();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('start');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi. Need help booking a movie ticket?' }
  ]);
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);

  const visible = token && user?.role !== 'Admin';

  useEffect(() => {
    if (!open || step !== 'movie') return;
    const loadMovies = async () => {
      setLoading(true);
      try {
        const res = await getMovies({ limit: 50 });
        setMovies(res.data || []);
      } catch {
        setMessages((prev) => [...prev, { from: 'bot', text: 'Could not load movies right now.' }]);
      } finally {
        setLoading(false);
      }
    };
    loadMovies();
  }, [open, step]);

  const addUserMessage = (text) => setMessages((prev) => [...prev, { from: 'user', text }]);
  const addBotMessage = (text) => setMessages((prev) => [...prev, { from: 'bot', text }]);

  const startBooking = () => {
    addUserMessage('Book a ticket');
    addBotMessage('Great. Pick a movie first.');
    setStep('movie');
  };

  const chooseMovie = async (movie) => {
    addUserMessage(movie.title);
    setSelectedMovie(movie);
    setLoading(true);
    try {
      const res = await getShows();
      const allShows = res.data || res || [];
      const movieShows = allShows
        .filter((s) => s.status === 'Active' && (s.movieId?._id === movie._id || s.movieId === movie._id))
        .sort((a, b) => new Date(a.showDate) - new Date(b.showDate));
      setShows(movieShows.slice(0, 10));

      if (!movieShows.length) {
        addBotMessage('No active shows found for this movie. Try another one.');
        setStep('movie');
      } else {
        addBotMessage('Nice choice. Select a show time and I will open seat selection.');
        setStep('show');
      }
    } catch {
      addBotMessage('Unable to fetch show timings right now.');
    } finally {
      setLoading(false);
    }
  };

  const chooseShow = (show) => {
    addUserMessage(formatShow(show));
    addBotMessage('Opening seat selection for this show.');
    navigate(`/booking?showId=${show._id}`);
    setOpen(false);
  };

  const resetFlow = () => {
    setStep('start');
    setSelectedMovie(null);
    setShows([]);
    setMessages([{ from: 'bot', text: 'Hi. Need help booking a movie ticket?' }]);
  };

  if (!visible) return null;

  return (
    <div className="rbms-chatbot-wrap">
      {open && (
        <div className="rbms-chatbot-card">
          <div className="rbms-chatbot-head">
            <strong>Booking Assistant</strong>
            <button className="btn btn-sm btn-light" onClick={() => setOpen(false)}>Close</button>
          </div>

          <div className="rbms-chatbot-body">
            {messages.map((m, idx) => (
              <div key={idx} className={`rbms-chat-msg ${m.from === 'user' ? 'is-user' : 'is-bot'}`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="rbms-chatbot-actions">
            {step === 'start' && (
              <>
                <button className="btn btn-danger btn-sm" onClick={startBooking}>Book ticket</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/movies')}>Browse movies</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/bookings')}>My bookings</button>
              </>
            )}

            {step === 'movie' && movies.slice(0, 8).map((movie) => (
              <button key={movie._id} className="btn btn-outline-primary btn-sm" onClick={() => chooseMovie(movie)}>
                {movie.title}
              </button>
            ))}

            {step === 'show' && (
              <>
                {selectedMovie && (
                  <div className="small text-muted w-100 mb-1">Movie: {selectedMovie.title}</div>
                )}
                {shows.map((show) => (
                  <button key={show._id} className="btn btn-outline-primary btn-sm" onClick={() => chooseShow(show)}>
                    {formatShow(show)}
                  </button>
                ))}
              </>
            )}

            <button className="btn btn-link btn-sm" onClick={resetFlow}>Reset</button>
          </div>
        </div>
      )}

      <button className="rbms-chatbot-trigger" onClick={() => setOpen((prev) => !prev)}>
        Booking Help
      </button>
    </div>
  );
}
