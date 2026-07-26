const dotenv = require('dotenv');
const mongoose = require('mongoose');

const Movie = require('./models/Movie');
const Theatre = require('./models/Theatre');
const Screen = require('./models/Screen');
const Seat = require('./models/Seat');
const Show = require('./models/Show');

dotenv.config();

const movieTitles = [
    'Dune: Part Two',
    'Inside Out 2',
    'Deadpool & Wolverine',
    'Wicked',
    'Moana 2',
    'Gladiator II',
    'Furiosa: A Mad Max Saga',
    'Godzilla x Kong: The New Empire',
    'Kingdom of the Planet of the Apes',
    'Civil War',
    'Challengers',
    'Twisters',
    'Bad Boys: Ride or Die',
    'Kung Fu Panda 4',
    'Despicable Me 4',
    'Beetlejuice Beetlejuice',
    'Alien: Romulus',
    'Venom: The Last Dance',
    'Smile 2',
    'A Quiet Place: Day One',
    'The Wild Robot',
    'Transformers One',
    'Joker: Folie a Deux',
    'The Substance',
    'Nosferatu',
    'Sonic the Hedgehog 3',
    'Mufasa: The Lion King',
    'The Fall Guy',
    'Monkey Man',
    'Abigail',
    'Trap',
    'Longlegs',
    'Heretic',
    'It Ends with Us',
    'The Beekeeper',
    'Argylle',
    'Mean Girls',
    'Madame Web',
    'IF',
    'The Garfield Movie',
    'The Ministry of Ungentlemanly Warfare',
    'Rebel Ridge',
    'Beverly Hills Cop: Axel F',
    'Hit Man',
    'Carry-On',
    'The Bikeriders',
    'Horizon: An American Saga',
    'The First Omen',
    'Immaculate',
    'Babygirl'
];

const genres = [
    ['Sci-Fi', 'Adventure'],
    ['Animation', 'Family'],
    ['Action', 'Comedy'],
    ['Musical', 'Fantasy'],
    ['Adventure', 'Family'],
    ['Action', 'Drama'],
    ['Action', 'Adventure'],
    ['Action', 'Sci-Fi'],
    ['Adventure', 'Sci-Fi'],
    ['Drama', 'Thriller'],
    ['Drama', 'Romance'],
    ['Action', 'Adventure'],
    ['Action', 'Comedy'],
    ['Animation', 'Comedy'],
    ['Animation', 'Family'],
    ['Comedy', 'Fantasy'],
    ['Horror', 'Sci-Fi'],
    ['Action', 'Superhero'],
    ['Horror', 'Thriller'],
    ['Horror', 'Drama']
];

const cities = [
    'Bangalore',
    'Mumbai',
    'Delhi',
    'Hyderabad',
    'Chennai',
    'Pune',
    'Kolkata',
    'Ahmedabad',
    'Jaipur',
    'Kochi'
];

const theatreBrands = [
    'PVR Nexus',
    'INOX Central',
    'Cinepolis Grand',
    'Miraj Cinemas',
    'Carnival Square',
    'Mukta A2',
    'Asian Cinemas',
    'City Pride',
    'Galaxy Multiplex',
    'Urvashi Digital'
];

const showTimes = ['10:00', '13:15', '16:30', '19:45', '22:30'];
const ticketPrice = { Regular: 150, Premium: 250, VIP: 400 };

const posterFor = (title) => (
    `https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=85&title=${encodeURIComponent(title)}`
);

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

const buildTheatreImage = (cityIndex, theatreIndex) => {
    const images = [
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1200&q=85'
    ];
    return images[(cityIndex + theatreIndex) % images.length];
};

const seed = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is missing in backend/.env');
    }

    await mongoose.connect(process.env.MONGO_URI);

    const savedMovies = [];
    for (let index = 0; index < movieTitles.length; index += 1) {
        const title = movieTitles[index];
        const movie = await Movie.findOneAndUpdate(
            { title },
            {
                $set: {
                    title,
                    genre: genres[index % genres.length],
                    language: index % 5 === 0 ? 'Hindi' : 'English',
                    duration: 105 + (index % 8) * 12,
                    rating: Number((7.1 + (index % 18) / 10).toFixed(1)),
                    description: `${title} is part of the recent demo catalogue for browsing, show creation, and ticket booking.`,
                    status: 'Active'
                },
                $setOnInsert: {
                    imageUrl: posterFor(title)
                }
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
        savedMovies.push(movie);
    }

    const savedScreens = [];
    for (let cityIndex = 0; cityIndex < cities.length; cityIndex += 1) {
        for (let theatreIndex = 0; theatreIndex < theatreBrands.length; theatreIndex += 1) {
            const city = cities[cityIndex];
            const theatreName = `${theatreBrands[theatreIndex]} ${city}`;
            const theatre = await Theatre.findOneAndUpdate(
                { name: theatreName, city },
                {
                    name: theatreName,
                    city,
                    location: `${theatreIndex + 1} Main Road, ${city}`,
                    imageUrl: buildTheatreImage(cityIndex, theatreIndex)
                },
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
    }

    await Show.deleteMany({ movieId: { $in: savedMovies.map(movie => movie._id) } });

    const shows = [];
    savedMovies.forEach((movie, movieIndex) => {
        const showDate = new Date();
        showDate.setDate(showDate.getDate() + (movieIndex % 14) + 1);
        showDate.setHours(0, 0, 0, 0);

        for (let showIndex = 0; showIndex < 5; showIndex += 1) {
            const screenIndex = (movieIndex * 5 + showIndex) % savedScreens.length;
            shows.push({
                movieId: movie._id,
                screenId: savedScreens[screenIndex]._id,
                showDate,
                showTime: showTimes[showIndex],
                ticketPrice,
                status: 'Active'
            });
        }
    });

    await Show.insertMany(shows);

    console.log(`Large seed complete: ${savedMovies.length} movies, ${cities.length} cities, ${savedScreens.length} theatres/screens, ${shows.length} shows.`);
    console.log('Every screen has 100 seats: 50 Regular, 25 Premium, 25 VIP.');
};

seed()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
