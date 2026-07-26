import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getToken } from './services/authService';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Reports from './pages/Reports';
import SeatSelection from './pages/SeatSelection';
import MovieList from './pages/MovieList';
import MovieDetails from './pages/MovieDetails';
import AdminCreateShow from './pages/AdminCreateShow';
import TheatreList from './pages/TheatreList';
import TheatreDetail from './pages/TheatreDetail';
import BookingHistory from './pages/BookingHistory';
import BookingAssistant from './components/BookingAssistant';
import MovieNotificationToast from './components/MovieNotificationToast';

const Protected = ({ children }) =>
  getToken() ? children : <Navigate to='/login' />;

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/movies"
            element={
              <Protected>
                <MovieList />
              </Protected>
            }
          />

          <Route
            path="/movies/:id"
            element={
              <Protected>
                <MovieDetails />
              </Protected>
            }
          />

          <Route
            path="/admin/show/create"
            element={
              <Protected>
                <AdminCreateShow />
              </Protected>
            }
          />

          <Route path="/booking" element={<Protected><SeatSelection /></Protected>} />
          <Route path="/reports" element={<Protected><Reports /></Protected>} />
          <Route path="/bookings" element={<Protected><BookingHistory /></Protected>} />

          <Route
            path="/booking/:showId"
            element={
              <Protected>
                <SeatSelection />
              </Protected>
            }
          />

          <Route path="/theatres" element={<Protected><TheatreList /></Protected>} />

          <Route path="/theatres/:id" element={<Protected><TheatreDetail /></Protected>} />

          <Route path="*" element={<Navigate to="/movies" />} />
        </Routes>
      </div>
      <BookingAssistant />
      <MovieNotificationToast />
    </BrowserRouter>
  );
}

export default App;
