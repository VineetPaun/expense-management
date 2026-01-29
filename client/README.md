# 🎨 Expense Management Client

React frontend application for the Expense Management system.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Dependencies](#dependencies)
- [Styling](#styling)

## 🔍 Overview

This is the frontend client for the Expense Management application. It provides a modern, responsive user interface for:

- User authentication (login/signup)
- Dashboard with expense overview
- Account management
- Transaction tracking and management

## 🛠 Tech Stack

| Technology           | Version | Purpose                  |
| -------------------- | ------- | ------------------------ |
| React                | 19.x    | UI library               |
| Vite                 | 7.x     | Build tool & dev server  |
| TailwindCSS          | 4.x     | Utility-first CSS        |
| React Router DOM     | 7.x     | Client-side routing      |
| Radix UI             | -       | Accessible UI components |
| TanStack React Table | 8.x     | Data tables              |
| Axios                | 1.x     | HTTP client              |
| Zod                  | 4.x     | Schema validation        |
| Lucide React         | -       | Icons                    |

## ✅ Prerequisites

- **Node.js** v18.x or higher
- **npm** v9.x or higher
- **Backend server** running on port 3000

## 📦 Installation

1. **Navigate to the client directory:**

   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:5173` with Hot Module Replacement (HMR) enabled.

### Production Build

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## 📁 Project Structure

```
client/
├── public/                    # Static assets
├── src/
│   ├── assets/               # Images and static resources
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base UI components (Button, Input, etc.)
│   │   └── ...              # Feature-specific components
│   ├── lib/                  # Utility functions
│   │   └── utils.js         # Helper functions (cn, etc.)
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Dashboard/Home page
│   │   ├── Login.jsx        # Login page
│   │   ├── Signup.jsx       # Registration page
│   │   └── ...
│   ├── App.jsx              # Main application component
│   ├── App.css              # App-specific styles
│   ├── index.css            # Global styles & Tailwind
│   └── main.jsx             # Application entry point
├── components.json          # shadcn/ui configuration
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML template
├── jsconfig.json            # JavaScript configuration
├── package.json
├── tailwind.config.js       # Tailwind configuration (if present)
└── vite.config.js           # Vite configuration
```

## 📜 Available Scripts

| Script      | Command           | Description                       |
| ----------- | ----------------- | --------------------------------- |
| **dev**     | `npm run dev`     | Start development server with HMR |
| **build**   | `npm run build`   | Create optimized production build |
| **preview** | `npm run preview` | Preview production build locally  |
| **lint**    | `npm run lint`    | Run ESLint for code quality       |

## 📦 Dependencies

### Production Dependencies

| Package                    | Version  | Purpose                 |
| -------------------------- | -------- | ----------------------- |
| `react`                    | ^19.2.0  | UI library              |
| `react-dom`                | ^19.2.0  | React DOM rendering     |
| `react-router-dom`         | ^7.13.0  | Client-side routing     |
| `axios`                    | ^1.13.3  | HTTP requests           |
| `zod`                      | ^4.3.6   | Schema validation       |
| `tailwindcss`              | ^4.1.18  | Utility-first CSS       |
| `@tailwindcss/vite`        | ^4.1.18  | Tailwind Vite plugin    |
| `tailwindcss-animate`      | ^1.0.7   | Animation utilities     |
| `lucide-react`             | ^0.563.0 | Icon library            |
| `clsx`                     | ^2.1.1   | Conditional class names |
| `tailwind-merge`           | ^3.4.0   | Merge Tailwind classes  |
| `class-variance-authority` | ^0.7.1   | Component variants      |

#### Radix UI Components

| Package                           | Version | Purpose            |
| --------------------------------- | ------- | ------------------ |
| `@radix-ui/react-checkbox`        | ^1.3.3  | Checkbox component |
| `@radix-ui/react-dialog`          | ^1.1.15 | Modal dialogs      |
| `@radix-ui/react-dropdown-menu`   | ^2.1.16 | Dropdown menus     |
| `@radix-ui/react-label`           | ^2.1.8  | Form labels        |
| `@radix-ui/react-navigation-menu` | ^1.2.14 | Navigation menu    |
| `@radix-ui/react-separator`       | ^1.1.8  | Visual separator   |
| `@radix-ui/react-slot`            | ^1.2.4  | Slot component     |

#### Data Table

| Package                 | Version | Purpose                  |
| ----------------------- | ------- | ------------------------ |
| `@tanstack/react-table` | ^8.21.3 | Powerful table component |

### Development Dependencies

| Package                       | Version | Purpose               |
| ----------------------------- | ------- | --------------------- |
| `vite`                        | ^7.2.4  | Build tool            |
| `@vitejs/plugin-react`        | ^5.1.1  | React plugin for Vite |
| `eslint`                      | ^9.39.1 | Code linting          |
| `eslint-plugin-react-hooks`   | ^7.0.1  | React hooks linting   |
| `eslint-plugin-react-refresh` | ^0.4.24 | Fast refresh linting  |
| `@types/react`                | ^19.2.5 | TypeScript types      |
| `@types/react-dom`            | ^19.2.3 | TypeScript types      |
| `globals`                     | ^16.5.0 | Global variables      |
| `tw-animate-css`              | ^1.4.0  | Animation CSS         |

### Installing All Dependencies

```bash
npm install
```

## 🎨 Styling

This project uses **TailwindCSS 4** for styling:

- **Utility-first approach:** Use Tailwind utility classes directly in components
- **Custom animations:** Provided by `tailwindcss-animate` and `tw-animate-css`
- **Component variants:** Managed with `class-variance-authority`
- **Class merging:** Use `cn()` utility from `lib/utils.js` for conditional classes

### Example Usage

```jsx
import { cn } from "@/lib/utils";

function Button({ variant = "default", className, ...props }) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md font-medium",
        variant === "primary" && "bg-blue-500 text-white",
        variant === "secondary" && "bg-gray-200 text-gray-800",
        className,
      )}
      {...props}
    />
  );
}
```

## 🔧 Configuration

### Vite Configuration

The Vite configuration is in `vite.config.js` and includes:

- React plugin for JSX support
- Path aliases for cleaner imports
- Development server settings

### ESLint Configuration

ESLint is configured in `eslint.config.js` with:

- React-specific rules
- React Hooks rules
- Fast Refresh support

---

<p align="center">🖥️ Client runs on port 5173</p>
