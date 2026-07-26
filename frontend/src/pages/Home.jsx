import { Link, Navigate } from 'react-router-dom';
import { getToken } from '../services/authService';

const featuredMovies = [
  {
    title: 'A Quiet Place: Day One',
    poster: 'https://image.tmdb.org/t/p/w500/nAU74GmpUk7t5iklEp3bufwDq4n.jpg'
  },
  {
    title: 'Alien: Romulus',
    poster: 'https://image.tmdb.org/t/p/w500/pJdItyeP5Ep5oYoqHlPpX4BEnPC.jpg'
  },
  {
    title: 'Avatar: The Way of Water',
    poster: 'https://image.tmdb.org/t/p/w500/qnzQm0PCVnSyv1dqpVmRgMWHbLD.jpg'
  },
  {
    title: 'Avengers: Endgame',
    poster: 'https://image.tmdb.org/t/p/w500/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg'
  },
  {
    title: 'Bad Boys: Ride or Die',
    poster: 'https://image.tmdb.org/t/p/w500/oGythE98MYleE6mZlGs5oBGkux1.jpg'
  },
  {
    title: 'Beetlejuice Beetlejuice',
    poster: 'https://image.tmdb.org/t/p/w500/28C4uHMHjp9uMB47qbWmufRVmGh.jpg'
  },
  {
    title: 'Deadpool & Wolverine',
    poster: 'https://image.tmdb.org/t/p/w500/v0Q2uYARIqui1sEBF0bCLJaliDI.jpg'
  },
  {
    title: 'Despicable Me 4',
    poster: 'https://image.tmdb.org/t/p/w500/5Fh4NdoEnCjCK9wLjdJ9DJNFl2b.jpg'
  },
  {
    title: 'Dune: Part Two',
    poster: 'https://image.tmdb.org/t/p/w500/3HzGtM0JpfH2pWFGugJK22LRP6b.jpg'
  },
  {
    title: 'Furiosa: A Mad Max Saga',
    poster: 'https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xceZprc.jpg'
  },
  {
    title: 'Gladiator II',
    poster: 'https://image.tmdb.org/t/p/w500/xbfAfaXZhw5fK3qQWRImlxb1HHi.jpg'
  },
  {
    title: 'Godzilla x Kong: The New Empire',
    poster: 'https://image.tmdb.org/t/p/w500/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg'
  }
];

const bookingHighlights = [
  {
    title: 'Pick Movies',
    text: 'Browse recent releases, show timings, languages, and ratings in a clean movie grid.',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=85'
  },
  {
    title: 'Choose Theatres',
    text: 'Find shows by theatre and city, then select the timing that fits your plan.',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=85'
  },
  {
    title: 'Reserve Seats',
    text: 'Select Regular, Premium, or VIP seats with clear pricing before confirming.',
    image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=900&q=85'
  }
];

export default function Home() {
  if (getToken()) {
    return <Navigate to="/movies" />;
  }

  return (
    <main className="cine-home">
      <section className="cine-hero">
        <div className="cine-hero__backdrop" />
        <div className="container cine-hero__content">
          <div className="cine-hero__copy">
            <div className="cine-kicker">Movies, theatres, seats, done.</div>
            <h1>CineHive</h1>
            <p>
              Book your next show in seconds. Browse fresh movies, pick a theatre,
              choose your seats, and keep every ticket in one place.
            </p>
            <div className="cine-hero__actions">
              <Link className="btn btn-danger btn-lg" to="/login">Login</Link>
              <Link className="btn btn-light btn-lg" to="/register">Sign Up</Link>
            </div>
          </div>

          <div className="cine-poster-strip" aria-label="Featured movies">
            {featuredMovies.slice(0, 4).map((movie) => (
              <img key={movie.title} src={movie.poster} alt={movie.title} />
            ))}
          </div>
        </div>
      </section>

      <section className="container cine-home__preview">
        <div>
          <span>50+</span>
          <p>Recent movies</p>
        </div>
        <div>
          <span>100</span>
          <p>Theatres across cities</p>
        </div>
        <div>
          <span>Fast</span>
          <p>Seat selection and booking</p>
        </div>
      </section>

      <section className="cine-marquee" aria-label="Popular movie posters">
        <div className="cine-marquee__track">
          {[...featuredMovies, ...featuredMovies].map((movie, index) => (
            <img key={`${movie.title}-${index}`} src={movie.poster} alt={movie.title} />
          ))}
        </div>
      </section>

      <section className="container cine-section">
        <div className="cine-section__head">
          <span>How booking feels</span>
          <h2>From movie mood to confirmed ticket, without the mess.</h2>
        </div>
        <div className="cine-feature-grid">
          {bookingHighlights.map((item) => (
            <article key={item.title} className="cine-feature-card">
              <img src={item.image} alt={item.title} />
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container cine-wide-banner">
        <div>
          <span>Ready for your next show?</span>
          <h2>Login to book tickets or create a new account in seconds.</h2>
        </div>
        <div className="cine-wide-banner__actions">
          <Link className="btn btn-danger btn-lg" to="/login">Login</Link>
          <Link className="btn btn-outline-primary btn-lg" to="/register">Sign Up</Link>
        </div>
      </section>
    </main>
  );
}
