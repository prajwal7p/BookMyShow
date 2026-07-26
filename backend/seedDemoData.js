const dotenv = require('dotenv');
const mongoose = require('mongoose');

const Movie = require('./models/Movie');
const Theatre = require('./models/Theatre');
const Screen = require('./models/Screen');
const Seat = require('./models/Seat');
const Show = require('./models/Show');

dotenv.config();

const posterBase = 'https://image.tmdb.org/t/p/w500';

const movies = [
    {
        title: 'Inception',
        genre: ['Sci-Fi', 'Action', 'Thriller'],
        language: 'English',
        duration: 148,
        rating: 8.8,
        description: 'A skilled thief enters dreams to steal secrets, then faces a mission to plant an idea.',
        imageUrl: `${posterBase}/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg`
    },
    {
        title: 'Interstellar',
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        language: 'English',
        duration: 169,
        rating: 8.7,
        description: 'Explorers travel through a wormhole to find a new home for humanity.',
        imageUrl: `${posterBase}/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg`
    },
    {
        title: 'The Dark Knight',
        genre: ['Action', 'Crime', 'Drama'],
        language: 'English',
        duration: 152,
        rating: 9.0,
        description: 'Batman faces the Joker, a criminal mastermind who throws Gotham into chaos.',
        imageUrl: `${posterBase}/qJ2tW6WMUDux911r6m7haRef0WH.jpg`
    },
    {
        title: 'Dune: Part Two',
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        language: 'English',
        duration: 166,
        rating: 8.5,
        description: 'Paul Atreides joins the Fremen and rises toward a destiny that could change Arrakis.',
        imageUrl: `${posterBase}/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg`
    },
    {
        title: 'Avengers: Endgame',
        genre: ['Action', 'Adventure', 'Superhero'],
        language: 'English',
        duration: 181,
        rating: 8.4,
        description: 'The Avengers assemble for one final attempt to undo Thanos and restore the universe.',
        imageUrl: `${posterBase}/or06FN3Dka5tukK1e9sl16pB3iy.jpg`
    },
    {
        title: 'Spider-Man: No Way Home',
        genre: ['Action', 'Adventure', 'Superhero'],
        language: 'English',
        duration: 148,
        rating: 8.2,
        description: 'Peter Parker turns to Doctor Strange when his identity is revealed to the world.',
        imageUrl: `${posterBase}/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg`
    },
    {
        title: 'The Matrix',
        genre: ['Sci-Fi', 'Action'],
        language: 'English',
        duration: 136,
        rating: 8.7,
        description: 'A hacker discovers that reality is a simulation and joins a fight for freedom.',
        imageUrl: `${posterBase}/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg`
    },
    {
        title: 'Avatar: The Way of Water',
        genre: ['Sci-Fi', 'Adventure', 'Fantasy'],
        language: 'English',
        duration: 192,
        rating: 7.6,
        description: 'Jake Sully and Neytiri protect their family as a new threat reaches Pandora.',
        imageUrl: `${posterBase}/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg`
    },
    {
        title: 'Oppenheimer',
        genre: ['Biography', 'Drama', 'History'],
        language: 'English',
        duration: 180,
        rating: 8.6,
        description: 'The story of J. Robert Oppenheimer and the creation of the atomic bomb.',
        imageUrl: `${posterBase}/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg`
    },
    {
        title: 'Top Gun: Maverick',
        genre: ['Action', 'Drama'],
        language: 'English',
        duration: 131,
        rating: 8.3,
        description: 'Maverick returns to train elite pilots for a dangerous mission.',
        imageUrl: `${posterBase}/62HCnUTziyWcpDaBO2i1DX17ljH.jpg`
    }
];

const theatres = [
    {
        name: 'thirumala',
        city: 'banglore',
        location: 'Main Road, Banglore',
        imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80'
    },
    {
        name: 'PVR Orion Mall',
        city: 'Bangalore',
        location: 'Orion Mall, Rajajinagar',
        imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80'
    },
    {
        name: 'INOX Garuda Mall',
        city: 'Bangalore',
        location: 'Garuda Mall, Magrath Road',
        imageUrl: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=1200&q=80'
    },
    {
        name: 'Cinepolis Nexus',
        city: 'Bangalore',
        location: 'Nexus Shantiniketan',
        imageUrl: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=1200&q=80'
    },
    {
        name: 'Miraj Cinemas',
        city: 'Bangalore',
        location: 'Marathahalli',
        imageUrl: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=1200&q=80'
    }
];

const showTimes = ['10:00', '13:15', '16:30', '19:45', '22:30'];
const ticketPrice = { Regular: 150, Premium: 250, VIP: 400 };

const buildSeats = (screenId) => {
    const seats = [];
    const rows = 'ABCDEFGHIJ'.split('');

    rows.forEach((row, rowIndex) => {
        for (let col = 1; col <= 10; col += 1) {
            const seatIndex = rowIndex * 10 + col;
            let seatType = 'VIP';
            if (seatIndex <= 50) seatType = 'Regular';
            else if (seatIndex <= 75) seatType = 'Premium';

            seats.push({
                screenId,
                seatNumber: `${row}${col}`,
                seatType
            });
        }
    });

    return seats;
};

const seed = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is missing in backend/.env');
    }

    await mongoose.connect(process.env.MONGO_URI);

    const savedMovies = [];
    for (const movie of movies) {
        const savedMovie = await Movie.findOneAndUpdate(
            { title: movie.title },
            { ...movie, status: 'Active' },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
        savedMovies.push(savedMovie);
    }

    const savedScreens = [];
    for (const theatreData of theatres) {
        const theatre = await Theatre.findOneAndUpdate(
            { name: theatreData.name, city: theatreData.city },
            theatreData,
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        const screen = await Screen.findOneAndUpdate(
            { theatreId: theatre._id, screenName: 'Screen 1' },
            { theatreId: theatre._id, screenName: 'Screen 1', totalSeats: 100 },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        await Seat.deleteMany({ screenId: screen._id });
        await Seat.insertMany(buildSeats(screen._id));
        savedScreens.push(screen);
    }

    await Show.deleteMany({ movieId: { $in: savedMovies.map(movie => movie._id) } });

    const shows = [];
    savedMovies.forEach((movie, movieIndex) => {
        const showDate = new Date();
        showDate.setDate(showDate.getDate() + movieIndex + 1);
        showDate.setHours(0, 0, 0, 0);

        savedScreens.forEach((screen, screenIndex) => {
            shows.push({
                movieId: movie._id,
                screenId: screen._id,
                showDate,
                showTime: showTimes[screenIndex],
                ticketPrice,
                status: 'Active'
            });
        });
    });

    await Show.insertMany(shows);

    console.log(`Seed complete: ${savedMovies.length} movies, ${savedScreens.length} screens, ${shows.length} shows.`);
    console.log('Seat layout per screen: 100 seats = 50 Regular, 25 Premium, 25 VIP.');
};

seed()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
