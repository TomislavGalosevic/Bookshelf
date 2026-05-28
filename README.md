# 📚 BookShelf

A full-stack web application for tracking your personal reading journey. Built with React, Node.js, Express, and SQLite.

## Features

- 🔍 **Book Discovery** — Search millions of books via Google Books API
- 📚 **Personal Shelf** — Organize books into Reading / Finished / Want to Read
- ⭐ **Ratings & Notes** — Rate books and add personal notes
- 📷 **Custom Covers** — Upload your own cover images
- 📥 **Export** — Download your library as CSV
- 🔐 **Authentication** — JWT-based login/register
- 📊 **Stats** — Track pages read, books finished, avg rating
- 📱 **Responsive** — Works on all screen sizes

## Tech Stack

| Part | Technology |
|------|-----------|
| Frontend | React, React Router, Axios |
| Backend | Node.js, Express |
| Database | SQLite (better-sqlite3) |
| Auth | JWT + bcrypt |
| File Upload | Multer |
| External API | Google Books API |
| Deploy | Railway |

---

## Local Development

### Prerequisites
- Node.js 18+
- npm

### Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set JWT_SECRET to any random string
npm run dev
```

Backend runs on: `http://localhost:5000`

### Frontend setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

> The frontend proxies API calls to `localhost:5000` via the `"proxy"` field in `package.json`.

---

## Deployment (Railway)

### Backend

1. Create account on [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo → select `/backend` folder
3. Add environment variables:
   ```
   JWT_SECRET=your_random_secret_here
   NODE_ENV=production
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```
4. Railway auto-detects Node.js and deploys

### Frontend

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repo → select `/frontend` folder
3. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
   ```
4. Deploy

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | Get all user's books |
| GET | `/api/books/search?q=query` | Search Google Books API |
| GET | `/api/books/stats` | Get reading statistics |
| GET | `/api/books/export` | Download CSV |
| POST | `/api/books` | Add book to shelf |
| PUT | `/api/books/:id` | Update book (status, rating, notes) |
| DELETE | `/api/books/:id` | Remove book |
| POST | `/api/books/:id/cover` | Upload custom cover |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/users/profile` | Update profile name |

---

## Project Structure

```
bookshelf/
├── backend/
│   ├── middleware/
│   │   └── auth.js          # JWT middleware
│   ├── models/
│   │   └── db.js            # SQLite setup & schema
│   ├── routes/
│   │   ├── auth.js          # Auth routes
│   │   ├── books.js         # Books CRUD + Google Books API
│   │   └── users.js         # User profile
│   ├── uploads/             # Uploaded cover images (gitignored)
│   ├── server.js            # Express entry point
│   ├── railway.toml         # Deployment config
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Navbar.js    # Navigation
        │   └── BookCard.js  # Book grid card with hover actions
        ├── context/
        │   └── AuthContext.js  # Global auth state
        ├── pages/
        │   ├── Home.js      # Landing page
        │   ├── Login.js     # Sign in
        │   ├── Register.js  # Create account
        │   ├── Search.js    # Discover books
        │   ├── Shelf.js     # My bookshelf
        │   └── Profile.js   # User profile & stats
        ├── api.js           # Axios instance
        ├── App.js           # Router setup
        └── index.css        # Global design system
```

## Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key |
| name | TEXT | Display name |
| email | TEXT | Unique |
| password | TEXT | bcrypt hashed |
| avatar | TEXT | URL (unused, for extension) |
| created_at | DATETIME | Auto |

### books
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key → users |
| google_books_id | TEXT | From Google Books API |
| title | TEXT | Required |
| author | TEXT | |
| description | TEXT | |
| cover_url | TEXT | From Google Books |
| custom_cover | TEXT | User uploaded |
| page_count | INTEGER | |
| published_year | TEXT | |
| genre | TEXT | |
| status | TEXT | reading / finished / want_to_read |
| rating | INTEGER | 1–5 |
| notes | TEXT | Personal notes |
| date_added | DATETIME | Auto |
| date_finished | DATETIME | Set when status = finished |
