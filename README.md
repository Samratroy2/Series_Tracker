# 🎬 Series Tracker

A full-stack web application for tracking anime, TV series, and movies in one place.

## 🚀 Features

* User authentication (signup/login)
* Add and manage anime/series entries
* Upload cover images/posters
* Track watching progress
* Search and filter content
* Responsive frontend UI
* Secure backend API

## 🛠 Tech Stack

### Frontend

* React.js
* CSS / Tailwind (if used)
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Multer (file uploads)

## 📂 Project Structure

```bash
ANIME-TRACKER/
│
├── backend/
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   │
│   ├── data/
│   │
│   ├── middleware/
│   │   └── upload.js
│   │
│   ├── models/
│   │   ├── Club.js
│   │   └── User.js
│   │
│   ├── node_modules/
│   │
│   ├── routes/
│   │   ├── admin.js
│   │   ├── anime.js
│   │   ├── authRoutes.js
│   │   ├── clubs.js
│   │   ├── messageRoutes.js
│   │   ├── polls.js
│   │   ├── shows.js
│   │   ├── userRoutes.js
│   │   └── users.js
│   │
│   ├── uploads/
│   │
│   ├── .env
│   ├── index.js
│   ├── package-lock.json
│   └── package.json
│
├── frontend/
│   │
│   ├── node_modules/
│   │
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   │
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── AdminRoute.js
│   │   │   ├── Filter.js
│   │   │   ├── FilterSection.js
│   │   │   ├── Poll.js
│   │   │   ├── PrivateRoute.js
│   │   │   ├── Sidebar.js
│   │   │   └── Slideshow.js
│   │   │
│   │   ├── constants/
│   │   │   └── AuthContext.js
│   │   │
│   │   ├── data/
│   │   │   └── fetchAnimeData.js
│   │   │
│   │   ├── pages/
│   │   │   ├── Admin.js
│   │   │   ├── AnimeDetails.js
│   │   │   ├── ClubPage.js
│   │   │   ├── Completed.js
│   │   │   ├── CreateClub.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Dropped.js
│   │   │   ├── FilterPage.js
│   │   │   ├── ForgotPassword.js
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── OnHold.js
│   │   │   ├── PlanToWatch.js
│   │   │   ├── ProfilePage.js
│   │   │   ├── Register.js
│   │   │   ├── ResetPassword.js
│   │   │   ├── Search.js
│   │   │   ├── VerifyOtp.js
│   │   │   ├── Watching.js
│   │   │   └── Watchlist.js
│   │   │
│   │   ├── App.js
│   │   ├── index.js
│   │   └── ThemeContext.js
│   │
│   ├── .gitignore
│   ├── package-lock.json
│   └── package.json
│
└── README.md
```

## ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/Samratroy2/Series_Tracker.git
cd Series_Tracker
```

### Install dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd backend
npm install
```

## 🔐 Environment Variables

Create a `.env` file inside `backend/`:

```env
MONGO_URI=your_database_url
JWT_SECRET=your_secret_key
PORT=5000
```

## ▶️ Run the project

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd frontend
npm start
```

## 📸 Screenshots



## 🤝 Contributing

Pull requests are welcome.

## 📄 License

This project is for learning and personal development.

## 👨‍💻 Author

**Samrat Roy**

