# 💰 Expense Management Application

A full-stack expense tracking application built with React, Vite, Express.js, and MongoDB.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Clone the Repository](#clone-the-repository)
  - [Setting Up the Server](#setting-up-the-server)
  - [Setting Up the Client](#setting-up-the-client)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)

## 🔍 Overview

This expense management application allows users to:

- Create an account and securely log in
- Manage bank accounts
- Track income and expenses through transactions
- View and analyze spending patterns

## 🛠 Tech Stack

### Frontend (Client)

- **React 19** - UI library
- **Vite 7** - Build tool and dev server
- **TailwindCSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **React Router DOM** - Client-side routing
- **TanStack React Table** - Powerful table component
- **Axios** - HTTP client
- **Zod** - Schema validation
- **Lucide React** - Icon library

### Backend (Server)

- **Express 5** - Web framework
- **MongoDB** with **Mongoose 9** - Database and ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **dotenv** - Environment configuration
- **CORS** - Cross-origin resource sharing

## ✅ Prerequisites

Before running this application, ensure you have the following installed:

| Requirement | Version                | Installation Guide                      |
| ----------- | ---------------------- | --------------------------------------- |
| **Node.js** | v18.x or higher        | [nodejs.org](https://nodejs.org/)       |
| **npm**     | v9.x or higher         | Comes with Node.js                      |
| **MongoDB** | Atlas (cloud) or local | [mongodb.com](https://www.mongodb.com/) |

> **Note:** The application is pre-configured to use MongoDB Atlas. You can use a local MongoDB instance by updating the connection string in the `.env` file.

## 📁 Project Structure

```
expense-management/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components (Login, Signup, Home, etc.)
│   │   ├── lib/           # Utility functions
│   │   └── assets/        # Static assets
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend API
│   ├── src/
│   │   ├── db/            # Database connection and models
│   │   └── routes/        # API route handlers
│   ├── .env               # Environment variables
│   └── package.json
└── README.md              # This file
```

## 🚀 Getting Started

### Clone the Repository

```bash
git clone <repository-url>
cd expense-management
```

### Setting Up the Server

1. **Navigate to the server directory:**

   ```bash
   cd server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the server directory (or update the existing one):

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key_here
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000`

### Setting Up the Client

1. **Open a new terminal and navigate to the client directory:**

   ```bash
   cd client
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

   The client will start on `http://localhost:5173`

## 🏃 Running the Application

To run the full application, you need both the server and client running simultaneously:

### Quick Start (Two Terminals)

**Terminal 1 - Server:**

```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Client:**

```bash
cd client
npm install
npm run dev
```

Once both are running:

- 🌐 **Frontend:** http://localhost:5173
- 🔧 **Backend API:** http://localhost:3000

## 🔐 Environment Variables

### Server (`server/.env`)

| Variable      | Description               | Example                                          |
| ------------- | ------------------------- | ------------------------------------------------ |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET`  | Secret key for JWT tokens | `your-secure-secret-key`                         |

> ⚠️ **Security Note:** Never commit your `.env` file to version control. Make sure it's listed in `.gitignore`.

## 📜 Available Scripts

### Client Scripts

| Script      | Command           | Description                    |
| ----------- | ----------------- | ------------------------------ |
| Development | `npm run dev`     | Start Vite dev server with HMR |
| Build       | `npm run build`   | Build for production           |
| Preview     | `npm run preview` | Preview production build       |
| Lint        | `npm run lint`    | Run ESLint                     |

### Server Scripts

| Script      | Command       | Description                             |
| ----------- | ------------- | --------------------------------------- |
| Development | `npm run dev` | Start server with nodemon (auto-reload) |

## 🤝 API Endpoints

| Method | Endpoint               | Description             |
| ------ | ---------------------- | ----------------------- |
| POST   | `/signup`              | Create new user account |
| POST   | `/signin`              | User login              |
| GET    | `/account`             | Get user accounts       |
| POST   | `/account`             | Create new account      |
| GET    | `/account/transaction` | Get transactions        |
| POST   | `/account/transaction` | Create new transaction  |

---

<p align="center">Made with ❤️ for better expense tracking</p>
