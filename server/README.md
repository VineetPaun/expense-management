# 🔧 Expense Management API Server

Express.js backend API for the Expense Management application.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Dependencies](#dependencies)

## 🔍 Overview

This is the backend API server for the Expense Management application. It provides RESTful endpoints for:

- User authentication (signup/signin)
- Bank account management
- Transaction tracking

## 🛠 Tech Stack

| Technology | Version | Purpose               |
| ---------- | ------- | --------------------- |
| Express.js | 5.x     | Web framework         |
| MongoDB    | -       | NoSQL database        |
| Mongoose   | 9.x     | MongoDB ODM           |
| JWT        | 9.x     | Authentication tokens |
| bcrypt     | 6.x     | Password hashing      |
| dotenv     | 17.x    | Environment variables |
| CORS       | 2.x     | Cross-origin requests |

## ✅ Prerequisites

- **Node.js** v18.x or higher
- **npm** v9.x or higher
- **MongoDB** (Atlas cloud or local instance)

## 📦 Installation

1. **Navigate to the server directory:**

   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## ⚙️ Configuration

Create a `.env` file in the server root directory with the following variables:

```env
# MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker

# JWT secret key (use a strong, random string)
JWT_SECRET=your-super-secret-jwt-key
```

### Environment Variables

| Variable      | Required | Description                       |
| ------------- | -------- | --------------------------------- |
| `MONGODB_URI` | ✅ Yes   | MongoDB connection string         |
| `JWT_SECRET`  | ✅ Yes   | Secret key for signing JWT tokens |

> ⚠️ **Important:** Never commit your `.env` file to version control!

## 🏃 Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

The server will start on `http://localhost:3000` with nodemon watching for file changes.

## 📁 Project Structure

```
server/
├── src/
│   ├── db/
│   │   ├── connectDB.js       # MongoDB connection setup
│   │   ├── userModel.js       # User schema and model
│   │   ├── accountModel.js    # Account schema and model
│   │   └── transactionModel.js # Transaction schema and model
│   ├── routes/
│   │   ├── user.js            # Auth routes (signup/signin)
│   │   ├── account.js         # Account management routes
│   │   └── transaction.js     # Transaction routes
│   └── index.js               # Main application entry point
├── .env                       # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🌐 API Endpoints

### Authentication

| Method | Endpoint  | Description       | Auth Required |
| ------ | --------- | ----------------- | ------------- |
| POST   | `/signup` | Register new user | ❌ No         |
| POST   | `/signin` | Login user        | ❌ No         |

### Accounts

| Method | Endpoint   | Description           | Auth Required |
| ------ | ---------- | --------------------- | ------------- |
| GET    | `/account` | Get all user accounts | ✅ Yes        |
| POST   | `/account` | Create new account    | ✅ Yes        |

### Transactions

| Method | Endpoint               | Description            | Auth Required |
| ------ | ---------------------- | ---------------------- | ------------- |
| GET    | `/account/transaction` | Get all transactions   | ✅ Yes        |
| POST   | `/account/transaction` | Create new transaction | ✅ Yes        |

## 📦 Dependencies

### Production Dependencies

| Package        | Version | Purpose               |
| -------------- | ------- | --------------------- |
| `express`      | ^5.2.1  | Web framework         |
| `mongoose`     | ^9.1.5  | MongoDB ODM           |
| `bcrypt`       | ^6.0.0  | Password hashing      |
| `jsonwebtoken` | ^9.0.3  | JWT authentication    |
| `cors`         | ^2.8.6  | CORS middleware       |
| `dotenv`       | ^17.2.3 | Environment variables |

### Installing Dependencies

```bash
# Install all dependencies
npm install

# Or install individually
npm install express mongoose bcrypt jsonwebtoken cors dotenv
```

### Dev Dependencies

The server uses `nodemon` for development (auto-restart on file changes). If not installed globally:

```bash
# Install nodemon globally (optional)
npm install -g nodemon
```

## 🔒 Security Notes

1. **JWT Tokens:** All protected routes require a valid JWT token in the Authorization header
2. **Password Hashing:** All passwords are hashed using bcrypt before storage
3. **Environment Variables:** Sensitive data should always be stored in `.env` files

---

<p align="center">📡 Server runs on port 3000</p>
