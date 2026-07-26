const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Screen = require('../models/Screen');

const getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const getCustomerBookingLimit = () => {
    const limit = getTodayStart();
    limit.setDate(limit.getDate() + 30);
    limit.setHours(23, 59, 59, 999);
    return limit;
};

const normalizeShowDate = (showDate) => {
    const normalizedDate = new Date(showDate);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate;
};

const validateShowDate = (showDate) => {
    if (!showDate) {
        return { error: "Show date is required" };
    }

    const normalizedDate = normalizeShowDate(showDate);

    if (Number.isNaN(normalizedDate.getTime())) {
        return { error: "Invalid show date" };
    }

    if (normalizedDate < getTodayStart()) {
        return { error: "Show date cannot be in the past" };
    }

    return { normalizedDate };
};

// ================= CREATE SHOW =================
exports.createShow = async (req, res) => {
    try {

        const { movieId, screenId, showDate, showTime, ticketPrice } = req.body;
        const { normalizedDate, error } = validateShowDate(showDate);

        if (error) {
            return res.status(400).json({ message: error });
        }

        // Validate movie
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        // Validate screen
        const screen = await Screen.findById(screenId);
        if (!screen) {
            return res.status(404).json({ message: "Screen not found" });
        }

        // Prevent duplicate show
        const existingShow = await Show.findOne({
            screenId,
            showDate: normalizedDate,
            showTime
        });

        if (existingShow) {
            return res.status(400).json({
                message: "A show already exists on this screen at the same time."
            });
        }

        // Create show
        const newShow = new Show({
            movieId,
            screenId,
            showDate: normalizedDate,
            showTime,
            ticketPrice: {
                Regular: Number(ticketPrice?.Regular || 0),
                Premium: Number(ticketPrice?.Premium || 0),
                VIP: Number(ticketPrice?.VIP || 0)
            }
        });

        await newShow.save();

        res.status(201).json({
            message: "Show created successfully",
            show: newShow
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getAllShows = async (req, res) => {
    try {
        const { movieId } = req.query;
        const filter = movieId ? { movieId } : {};

        if (req.user?.role !== 'Admin') {
            filter.status = 'Active';
            filter.showDate = {
                $gte: getTodayStart(),
                $lte: getCustomerBookingLimit()
            };
        }

        const shows = await Show.find(filter)
            .populate('movieId')
            .populate({
                path: 'screenId',
                populate: {
                    path: 'theatreId'
                }
            })
            .sort({ showDate: 1, showTime: 1 });

        res.status(200).json(shows);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ================= GET SHOW BY ID =================
exports.getShowById = async (req, res) => {
    try {

        const show = await Show.findById(req.params.id)
            .populate('movieId')
            .populate({
                path: 'screenId',
                populate: {
                    path: 'theatreId'
                }
            });

        if (!show) {
            return res.status(404).json({ message: "Show not found" });
        }

        res.status(200).json(show);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ================= CANCEL SHOW =================
exports.cancelShow = async (req, res) => {
    try {

        const show = await Show.findById(req.params.id);

        if (!show) {
            return res.status(404).json({ message: "Show not found" });
        }

        show.status = "Cancelled";

        await show.save();

        res.status(200).json({
            message: "Show cancelled successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.updateShow = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id);

        if (!show) {
            return res.status(404).json({ message: "Show not found" });
        }

        if (show.status === 'Cancelled') {
            return res.status(400).json({ message: "Cannot edit a cancelled show" });
        }

        const { showDate, showTime, ticketPrice } = req.body;
        const nextShowDate = showDate ? validateShowDate(showDate) : { normalizedDate: show.showDate };

        if (nextShowDate.error) {
            return res.status(400).json({ message: nextShowDate.error });
        }

        const existingShow = await Show.findOne({
            screenId: show.screenId,
            showDate: nextShowDate.normalizedDate,
            showTime: showTime || show.showTime,
            _id: { $ne: req.params.id }
        });

        if (existingShow) {
            return res.status(400).json({ message: "Another show already exists at this time." });
        }

        if (showDate) show.showDate = nextShowDate.normalizedDate;
        if (showTime) show.showTime = showTime;
        if (ticketPrice) {
            show.ticketPrice = {
                Regular: Number(ticketPrice?.Regular ?? show.ticketPrice?.Regular ?? 0),
                Premium: Number(ticketPrice?.Premium ?? show.ticketPrice?.Premium ?? 0),
                VIP: Number(ticketPrice?.VIP ?? show.ticketPrice?.VIP ?? 0)
            };
        }

        await show.save();

        res.status(200).json({ message: "Show updated successfully", show });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
