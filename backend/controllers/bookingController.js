const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Seat = require('../models/Seat');
const { createNotification } = require('./reportController');

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


// 🔹 Create Booking
exports.createBooking = async (req, res) => {
    try {
        const { showId, seats } = req.body;
        const userId = req.user.id;

        // 1️⃣ Check if show exists
        const show = await Show.findById(showId);
        if (!show) {
            return res.status(404).json({ message: "Show not found" });
        }

        const showDateOnly = new Date(show.showDate);
        showDateOnly.setHours(0, 0, 0, 0);

        if (showDateOnly < getTodayStart()) {
            return res.status(400).json({
                message: "Cannot book past shows."
            });
        }

        if (showDateOnly > getCustomerBookingLimit()) {
            return res.status(400).json({
                message: "Bookings are available only for the next 30 days."
            });
        }

        // Prevent booking if show already started (date + time combined)
        const currentDateTime = new Date();
        const [hours, minutes] = (show.showTime || '00:00').split(':').map(Number);
        const showDateTime = new Date(show.showDate);
        showDateTime.setHours(hours, minutes, 0, 0);

        if (currentDateTime > showDateTime) {
            return res.status(400).json({
                message: "Cannot book. Show has already started."
            });
        }

        // 2️⃣ Check if show is cancelled
        if (show.status === "Cancelled") {
            return res.status(400).json({
                message: "Cannot book cancelled show"
            });
        }

        // 3️⃣ Check if seats already booked
        const existingBooking = await Booking.find({
            showId,
            seats: { $in: seats },
            status: "Confirmed"
        });

        if (existingBooking.length > 0) {
            return res.status(400).json({
                message: "One or more seats already booked"
            });
        }

        // 4️⃣ Calculate total amount
        const seatDocs = await Seat.find({
            screenId: show.screenId,
            seatNumber: { $in: seats }
        });

        const totalAmount = seatDocs.reduce((sum, seat) => {
            const price = show.ticketPrice?.[seat.seatType] ?? show.ticketPrice?.Regular ?? 0;
            return sum + price;
        }, 0);

        // 5️⃣ Create booking
        const newBooking = new Booking({
            userId,
            showId,
            seats,
            totalAmount
        });

        await newBooking.save();

        // 🔔 Spoorthy: Notify user of booking confirmation
        const showDateStr = show.showDate
            ? new Date(show.showDate).toDateString()
            : 'upcoming';
        await createNotification(
            userId,
            `Booking confirmed! 🎉 Show on ${showDateStr} at ${show.showTime}. Total: ₹${totalAmount}.`
        );

        res.status(201).json({
            message: "Booking successful",
            booking: newBooking
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// 🔹 Get Booking History by User
exports.getBookingsByUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const bookings = await Booking.find({ userId })
            .populate({
                path: 'showId',
                populate: [
                    { path: 'movieId', select: 'title' },
                    {
                        path: 'screenId',
                        select: 'screenName theatreId',
                        populate: { path: 'theatreId', select: 'name city' }
                    }
                ]
            });

        res.status(200).json(bookings);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// 🔹 Cancel Booking
exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        const show = await Show.findById(booking.showId);

        const currentDateTime = new Date();
        const [hours, minutes] = (show.showTime || '00:00').split(':').map(Number);
        const showDateTime = new Date(show.showDate);
        showDateTime.setHours(hours, minutes, 0, 0);

        if (currentDateTime > showDateTime) {
            return res.status(400).json({
                message: "Cannot cancel after show started"
            });
        }

        booking.status = "Cancelled";
        await booking.save();

        // 🔔 Spoorthy: Notify user of booking cancellation
        await createNotification(
            booking.userId.toString(),
            `Your booking has been cancelled. Show was on ${new Date(show.showDate).toDateString()} at ${show.showTime}.`
        );

        res.status(200).json({
            message: "Booking cancelled successfully",
            booking
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// 🔹 Delete All Bookings (Temporary)
exports.deleteAllBookings = async (req, res) => {
    try {
        await Booking.deleteMany({});
        res.status(200).json({ message: "All bookings deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// 🔹 Get Seat Availability for a Show
exports.getSeatAvailability = async (req, res) => {
    try {
        const { showId } = req.params;

        const bookings = await Booking.find({
            showId,
            status: "Confirmed"
        });

        let bookedSeats = [];

        bookings.forEach((booking) => {
            bookedSeats = [...bookedSeats, ...booking.seats];
        });

        res.status(200).json({
            showId,
            bookedSeats
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
