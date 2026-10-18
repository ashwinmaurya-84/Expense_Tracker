# Expense Tracker

A full-stack expense management application built with React, Node.js, Express, and MongoDB. It supports authenticated expense management, filtering, pagination, sorting, and monthly expense analytics.

## Features

- User registration and login with JWT authentication
- Password hashing with bcrypt
- Create, read, update, and delete expenses
- User-specific expense access
- Filter expenses by category and date range
- Sort and paginate expense records
- Monthly expense analytics with chart visualization
- Centralized error handling and input validation
- Automated backend tests using Jest and Supertest

## Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- Recharts

**Backend**
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcrypt

**Testing and Tools**
- Jest
- Supertest
- Postman / Thunder Client
- Git and GitHub

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB database
- Git

### 1. Clone the repository

```bash
git clone https://github.com/ashwinmaurya-84/Expense_Tracker.git
cd Expense_Tracker
```

### 2. Configure environment variables

Create the backend environment file using `backend/.env.example` as a reference.

Configure the required variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Use your own credentials and secrets. Never commit `.env` files.

### 3. Install dependencies

```bash
cd backend
npm install
```

In a separate terminal:

```bash
cd frontend
npm install
```

### 4. Start the application

Start the backend from the `backend` directory:

```bash
npm run dev
```

Start the frontend from the `frontend` directory:

```bash
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## Testing

Run the backend test suite from the `backend` directory:

```bash
npm test
```

The current backend test suite contains 36 passing tests across 3 test suites.

Run frontend lint checks from the `frontend` directory:

```bash
npm run lint
```

Build the frontend for production:

```bash
npm run build
```

## API Overview

The API uses JSON requests and JWT bearer-token authentication for protected routes.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Authenticate a user |
| GET | `/expenses` | List expenses |
| POST | `/expenses` | Create an expense |
| GET | `/expenses/:id` | Retrieve an expense |
| PATCH | `/expenses/:id` | Update an expense |
| DELETE | `/expenses/:id` | Delete an expense |
| GET | `/expenses/summary/monthly` | Retrieve monthly expense analytics |

Protected endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

Expense listing supports category filtering, date-range filtering, sorting, and pagination through query parameters.

## Project Status

- [x] Backend setup
- [x] Authentication
- [x] Expense CRUD
- [x] Filtering, sorting, and pagination
- [x] Monthly analytics
- [x] Frontend integration
- [x] Backend automated tests
- [x] Frontend lint and production build checks
- [ ] Production deployment

## Future Improvements

- Production deployment
- API documentation with request and response examples
- Performance and bundle-size optimization

## Author

**Ashwin Maurya**

GitHub: [ashwinmaurya-84](https://github.com/ashwinmaurya-84)
