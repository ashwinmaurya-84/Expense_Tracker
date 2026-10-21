# Expense Tracker

A full-stack expense management application built with React, Node.js, Express, and MongoDB. Track expenses, manage transactions, analyze spending, and export expense data through a REST API.

## Live Demo

- **Frontend:** https://expense-tracker-9qv69e8ak-ashwinmaurya-dev.vercel.app
- **Backend API:** https://expense-tracker-api-kf0g.onrender.com
- **Repository:** https://github.com/ashwinmaurya-84/Expense_Tracker

## Features

- **Authentication:** User registration, login, and protected profile endpoint.
- **Expense Management:** Create, retrieve, update, and delete expenses.
- **Filtering & Sorting:** Filter expenses by category and date range; sort by supported fields.
- **Pagination:** Retrieve expense records in manageable pages.
- **Expense Analytics:** Access expense summaries and monthly summaries.
- **CSV Export:** Export expense records to a CSV file.
- **API Security:** JWT authentication, password hashing, security headers, and login rate limiting.
- **Input Validation:** Validate expense data and request parameters.
- **Automated Testing:** Backend tests using Jest and Supertest.
- **Responsive Frontend:** React-based interface for managing expenses.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens (JWT), bcrypt |
| Security | Helmet, CORS, express-rate-limit |
| Validation | Validator |
| Testing | Jest, Supertest |
| Deployment | Vercel, Render |
| API Testing | Postman / Thunder Client |

## Architecture

```text
React Frontend (Vercel)
        |
        | HTTP requests / JWT
        v
Express REST API (Render)
        |
        +-- Authentication
        +-- Expense Management
        +-- Filtering & Pagination
        +-- Analytics & CSV Export
        |
        v
MongoDB Atlas
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB Atlas account or a local MongoDB instance
- Git

### 1. Clone the repository

```bash
git clone https://github.com/ashwinmaurya-84/Expense_Tracker.git
cd Expense_Tracker
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_private_secret
```

Replace the MongoDB URI and JWT secret with your own values. Never commit real credentials to GitHub.

Start the backend:

```bash
npm run dev
```

The API should be available at `http://localhost:5000`.

### 3. Configure the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend`:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

## API Documentation

**Production base URL:** `https://expense-tracker-api-kf0g.onrender.com`

All expense endpoints and the profile endpoint require authentication unless stated otherwise.

### Authentication

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| GET | `/` | Check API availability | No |
| POST | `/auth/register` | Register a user | No |
| POST | `/auth/login` | Log in | No |
| GET | `/auth/profile` | Retrieve the authenticated user's profile | JWT required |

Registration request example:

```json
{
  "name": "Your Name",
  "email": "you@example.com",
  "password": "YourStrongPassword1"
}
```

Login request example:

```json
{
  "email": "you@example.com",
  "password": "YourStrongPassword1"
}
```

### Expense Management

| Method | Endpoint | Description |
|---|---|---|
| POST | `/expenses` | Create an expense |
| GET | `/expenses` | List expenses with filtering, sorting, and pagination |
| GET | `/expenses/:id` | Retrieve an expense by ID |
| PATCH | `/expenses/:id` | Update an expense |
| DELETE | `/expenses/:id` | Delete an expense |
| GET | `/expenses/summary` | Retrieve an expense summary |
| GET | `/expenses/summary/monthly` | Retrieve monthly expense summaries |
| GET | `/expenses/export` | Export expenses as CSV |

### Authentication Header

For protected endpoints, include the JWT returned by the login endpoint:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Create an Expense

`POST /expenses`

```json
{
  "title": "Lunch",
  "amount": 250,
  "category": "Food",
  "date": "2026-10-19"
}
```

### Update an Expense

`PATCH /expenses/:id`

Send only the fields you want to update:

```json
{
  "title": "Dinner",
  "amount": 400
}
```

### Filtering, Sorting, and Pagination

Example request:

```http
GET /expenses?category=Food&page=1&limit=10&sortBy=date&order=desc
```

Supported query parameters:

| Parameter | Purpose |
|---|---|
| `category` | Filter by category |
| `startDate` | Filter from a start date |
| `endDate` | Filter through an end date |
| `page` | Page number |
| `limit` | Number of records per page, up to 100 |
| `sortBy` | `date`, `amount`, `title`, or `createdAt` |
| `order` | `asc` or `desc` |

### Export Expenses

Request `GET /expenses/export` with a valid JWT to download the matching expense records as `expenses.csv`. Category, date range, and sorting parameters are supported.

## Running Tests

From the backend directory:

```bash
npm test
```

The backend test suite uses Jest and Supertest.

## Production Environment Variables

Configure these variables in the hosting provider's environment settings.

### Backend

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign and verify JWTs |
| `CLIENT_URL` | Deployed frontend origin allowed by CORS |
| `PORT` | Port supplied by the hosting platform; defaults to `5000` locally |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

Production frontend configuration:

```env
VITE_API_URL=https://expense-tracker-api-kf0g.onrender.com
```

## Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

Ensure the backend's `CLIENT_URL` matches the deployed frontend origin and the frontend's `VITE_API_URL` points to the backend. Redeploy after changing production environment variables.

## Security Notes

- Passwords are hashed before being stored.
- Protected endpoints require JWT authentication.
- Login requests are rate-limited.
- Helmet adds security-related HTTP headers.
- Keep `.env` files and production secrets out of version control.

## Roadmap

- [x] Backend setup and database connection
- [x] Authentication
- [x] Expense CRUD operations
- [x] Filtering and pagination
- [x] Expense summaries and monthly analytics
- [x] Frontend integration
- [x] Automated backend tests
- [x] Deployment
- [x] API documentation

## Author

**Ashwin Maurya**

- GitHub: https://github.com/ashwinmaurya-84

---

*Built as a full-stack project to practice REST API development, authentication, database integration, validation, testing, and deployment.*
