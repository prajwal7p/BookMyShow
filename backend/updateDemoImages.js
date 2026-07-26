const dotenv = require('dotenv');
const mongoose = require('mongoose');

const Movie = require('./models/Movie');
const Theatre = require('./models/Theatre');

dotenv.config();

const theatreImages = [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=1200&q=85'
];

const seededCities = [
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

const seededBrands = [
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

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const posterFromTmdbSearch = async (title) => {
    const response = await fetch(`https://www.themoviedb.org/search?query=${encodeURIComponent(title)}`, {
        headers: {
            'user-agent': 'Mozilla/5.0'
        }
    });

    if (!response.ok) {
        throw new Error(`TMDB search failed for ${title}: ${response.status}`);
    }

    const html = await response.text();
    const exactBlock = html.match(new RegExp(`<h2[^>]*>\\s*<span>${escapeRegex(title)}</span>[\\s\\S]*?srcset="([^"]+)"`, 'i'));
    const srcset = exactBlock?.[1] || html.match(/srcset="([^"]*media\.themoviedb\.org\/t\/p\/w94_and_h141_face[^"]+)"/)?.[1];
    const posterPath = srcset?.match(/w94_and_h141_face\/([^"\s]+?\.(?:jpg|png|webp))/i)?.[1];

    if (!posterPath) {
        return null;
    }

    return `https://image.tmdb.org/t/p/w500/${posterPath}`;
};

const updateMovies = async () => {
    const movies = await Movie.find({
        status: 'Active',
        title: { $ne: 'a' },
        imageUrl: /placehold|no-photos/
    }).sort({ title: 1 });

    let updated = 0;
    for (const movie of movies) {
        try {
            await sleep(1800);
            const posterUrl = await posterFromTmdbSearch(movie.title);
            if (!posterUrl) {
                console.log(`No poster found: ${movie.title}`);
                continue;
            }

            movie.imageUrl = posterUrl;
            await movie.save();
            updated += 1;
            console.log(`Poster updated: ${movie.title}`);
        } catch (error) {
            console.log(`Poster skipped: ${movie.title} (${error.message})`);
        }
    }

    return updated;
};

const updateTheatres = async () => {
    let updated = 0;

    for (const city of seededCities) {
        for (let index = 0; index < seededBrands.length; index += 1) {
            const name = `${seededBrands[index]} ${city}`;
            const imageUrl = theatreImages[index % theatreImages.length];
            const result = await Theatre.updateOne({ name, city }, { imageUrl });
            updated += result.modifiedCount;
        }
    }

    await Theatre.updateOne(
        { name: 'thirumala', city: 'banglore' },
        { imageUrl: theatreImages[0] }
    );

    return updated;
};

const run = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is missing in backend/.env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    const moviesUpdated = await updateMovies();
    const theatresUpdated = await updateTheatres();

    console.log(`Image update complete: ${moviesUpdated} movie posters updated, ${theatresUpdated} theatre images updated.`);
};

run()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
