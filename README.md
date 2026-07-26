
# RevBookMyShow – Movie Ticket Booking System

---

## 📌 Project Overview
**RevBookMyShow** is a movie ticket booking system that allows customers to browse movies, check show timings, select seats, and book tickets. Theatre Administrators can manage theatres, screens, movies, shows, pricing, and monitor bookings.

---



## 🚀 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React.js (Vite)                   |
| Backend    | Node.js + Express.js              |
| Database   | MongoDB + Mongoose                |
| Auth       | JWT (JSON Web Tokens)             |

---

## 📁 Project Structure

```
RevBookMyShow/bookmyshow
|
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Movie.js
│   │   ├── Theatre.js
│   │   ├── Screen.js
│   │   ├── Seat.js
│   │   ├── Show.js               # ticketPrice: { Regular, Premium, VIP }
│   │   ├── Booking.js
│   │   ├── BookingSeat.js
│   │   └── Notification.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── movieController.js
│   │   ├── theatreController.js
│   │   ├── showController.js
│   │   ├── bookingController.js
│   │   └── reportController.js
│   ├── routes/
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verify + role check
│   ├── .env                      # (DO NOT commit this file)
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── MovieList.jsx     # Browse & search movies
│   │   │   ├── MovieDetails.jsx  # Movie info + available shows
│   │   │   ├── TheatreList.jsx   # Customer theatre browser
│   │   │   ├── TheatreDetail.jsx # Screen & seat viewer (read-only)
│   │   │   ├── SeatSelection.jsx # Seat map + booking flow
│   │   │   ├── BookingHistory.jsx
│   │   │   ├── AdminCreateShow.jsx  # Admin Panel (Movies, Shows, Theatres)
│   │   │   └── Reports.jsx       # Revenue, Occupancy, Notifications
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── services/             # Axios API call functions
│   │   │   ├── authService.js
│   │   │   ├── movieService.js
│   │   │   ├── theatreService.js
│   │   │   ├── showService.js
│   │   │   └── bookingService.js
│   │   ├── App.jsx               # All routes defined here
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── docs/                         # API testing guides per module
├── .gitignore
└── README.md
```

---

## 🌐 Application Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Login page |
| `/register` | Public | Register page |
| `/movies` | All users | Browse & search movies |
| `/movies/:id` | All users | Movie details + available shows |
| `/theatres` | Customer only | Browse theatres |
| `/theatres/:id` | Customer only | Theatre screens & seats (read-only) |
| `/booking` | Customer | Seat selection & booking |
| `/bookings` | Customer | My booking history |
| `/admin/show/create` | Admin only | Admin panel (movies, shows, theatres) |
| `/reports` | All logged-in | Reports (admin) + Notifications (customer) |

---

## ⚙️ Getting Started (For All Teammates)

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/prajwal7p/BookMyShow.git
cd bookmyshow
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file inside `backend/`:
```
MONGO_URI=mongodb://localhost:27017/revbookmyshow
JWT_SECRET=your_jwt_secret_key
PORT=5000
```
Run the backend:
```bash
npx nodemon server.js
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on **http://localhost:5173**

---

## 🎟️ Key Features

### Customer
- Browse and search movies (by title, genre, language)
- View available shows per movie grouped by theatre
- Visual seat map with colour-coded Regular / Premium / VIP seats
- Per-seat-type pricing (different price per seat category)
- Booking confirmation with seat breakdown and total
- Booking history and cancellation (before show start only)
- In-app notifications for bookings and cancellations
- Browse theatres and view their screens/seats

### Admin Panel (single page — 3 tabs)
| Tab | Manages |
|-----|---------|
| Movie Management | Add / Edit / Delete movies |
| Show Management | Create / Edit / Cancel shows with per-type pricing |
| Theatre Management | Add/Edit/Delete theatres → screens → configure seats |

---

## 🌿 Git Workflow (MANDATORY for all teammates)

```bash
# 1. Always pull latest main before starting work
git checkout main
git pull origin main

# 2. Create / switch to your feature branch
git checkout -b feature/your-module-name

# 3. Make changes, then commit
git add .
git commit -m "feat: Day1 - description of what you did (YourName)"

# 4. Push your branch
git push origin feature/your-module-name

# 5. Create a Pull Request on GitHub for review
```

---

## 📚 API Documentation

See the `/docs` folder for detailed API testing guides:

| File | Module |
|------|--------|
| `AUTH_TESTING.md` | Register, Login, Forgot Password |
| `MOVIE_TESTING.md` | Movie CRUD |
| `THEATRE_TESTING.md` | Theatre, Screen & Seat management |
| `BOOKING_TESTING.md` | Show creation & Booking flow |
| `REPORTS_TESTING.md` | Revenue, Occupancy & Notifications |

> **Base URL:** `http://localhost:5000/api`  
> **Frontend URL:** `http://localhost:5173`
