# 📋 PlanFlow — Full-Stack React 19 & PostgreSQL Todo Application

A modern, high-performance, full-stack Task & Todo Management application built with **React 19**, **Vite**, **Express.js**, and **PostgreSQL**. Features automatic schema migrations, relational subtasks with cascading deletes, real-time analytics, preloaded mockup data, and complete dual-mode fallback resilience.

---

## 🌟 Highlights & Key Features

### 💻 Frontend (React 19 + Vite)
- **Interactive Metric Dashboard**: Live statistics showing Total Tasks, Due Today, In Progress, Completed, and Overdue tasks, complete with an animated progress bar and completion rate.
- **One-Click Filtering from Cards**: Click any stat card (e.g. Overdue or Completed) to immediately filter the view.
- **Hierarchical Subtasks Checklist**: Each task supports dynamic subtasks with an interactive dropdown checklist and live progress tracking (`X/Y subtasks completed`).
- **Comprehensive Task Modal**: Add or edit tasks with Title, Description/Notes, Category, Priority (High / Medium / Low), Due Date, and dynamic checklist items.
- **Search & Multi-Filtering**:
  - Instant live search querying titles, descriptions, and individual subtask items.
  - Category badges with dedicated color coding (*Work*, *Personal*, *Learning*, *Health & Fitness*, *Finance*).
  - Status tabs (*All*, *Active*, *Completed*, *High Priority*, *Overdue*).
  - Sorting by *Due Date*, *Priority*, *Date Created*, or *Alphabetical (A–Z)* with ascending/descending toggle.
- **Task Duplication & Safe Deletion**: One-click task cloning and a custom confirmation dialog to prevent accidental deletion.
- **Theme Toggle**: Clean Light Mode and slick Dark Mode with automatic local preference persistence.
- **Database Status Indicator**: Top navigation pill reflecting live PostgreSQL connection status with a pulsing indicator.

### ⚙️ Backend (Node.js + Express + PostgreSQL)
- **Automatic Schema Migrations**: Detects and creates tables (`todos` and `subtasks`) on startup.
- **Automatic Database Creation**: If the target database (`todo_db`) doesn't exist, the backend automatically creates it via the maintenance connection.
- **Relational Integrity**: Foreign-key relationships with `ON DELETE CASCADE` ensure subtasks are cleanly managed.
- **Preloaded Mockup Data Seeding**: Seeds the database with realistic sample tasks across categories when empty or upon clicking *"Reset Mock Data"*.
- **Fail-Safe Fallback**: If the database connection is pending or temporarily unavailable, the API gracefully falls back to memory mode, keeping the UI fully operational without crashing.
- **Single-Command Concurrency**: Runs frontend and backend concurrently in one terminal via `npm run dev`.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Port 5173)"]
        UI["React 19 UI / Components"]
        Ctx["TodoContext State Manager"]
        Vite["Vite Dev Server (/api proxy)"]
        UI --> Ctx
        Ctx --> Vite
    end

    subgraph Server["Backend Server (Port 5000)"]
        Exp["Express.js REST API"]
        Router["API Route Handlers"]
        DBLayer["PostgreSQL Client Pool (pg)"]
        Vite -- "Proxied HTTP Requests" --> Exp
        Exp --> Router
        Router --> DBLayer
    end

    subgraph Database["PostgreSQL (Port 5432)"]
        T["todos Table"]
        S["subtasks Table (ON DELETE CASCADE)"]
        DBLayer --> T
        DBLayer --> S
    end
```

---

## 🗄️ Database Schema & Relational Design

### 1. `todos` Table
| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(100)` | `PRIMARY KEY` | Unique task identifier |
| `title` | `VARCHAR(255)` | `NOT NULL` | Task title |
| `description` | `TEXT` | `NULLABLE` | Detailed notes or context |
| `category` | `VARCHAR(50)` | `DEFAULT 'work'` | Category identifier |
| `priority` | `VARCHAR(20)` | `DEFAULT 'medium'` | Priority level (`high`, `medium`, `low`) |
| `due_date` | `DATE` | `NULLABLE` | Task deadline (YYYY-MM-DD) |
| `completed` | `BOOLEAN` | `DEFAULT FALSE` | Task completion status |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of creation |

### 2. `subtasks` Table
| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(100)` | `PRIMARY KEY` | Unique subtask identifier |
| `todo_id` | `VARCHAR(100)` | `REFERENCES todos(id) ON DELETE CASCADE` | Foreign key referencing parent task |
| `title` | `VARCHAR(255)` | `NOT NULL` | Subtask checklist item |
| `completed` | `BOOLEAN` | `DEFAULT FALSE` | Subtask completion status |
| `position` | `INT` | `DEFAULT 0` | Order of display |

---

## 📡 REST API Reference

All requests pass through the Vite proxy (`/api`) to the Express backend running on port `5000`.

| Method | Endpoint | Description | Request Body Example |
|---|---|---|---|
| `GET` | `/api/health` | Check PostgreSQL database connectivity | *None* |
| `GET` | `/api/todos` | Fetch all tasks with aggregated subtasks | *None* |
| `POST` | `/api/todos` | Create a new task and subtasks | `{"title": "Task", "category": "work", "priority": "high", "dueDate": "2026-10-14", "subtasks": ["Sub 1"]}` |
| `PUT` | `/api/todos/:id` | Update an existing task | `{"title": "Updated Task", "priority": "medium"}` |
| `DELETE` | `/api/todos/:id` | Delete a task (cascades subtasks) | *None* |
| `PATCH` | `/api/todos/:id/toggle` | Toggle task completion status | *None* |
| `PATCH` | `/api/todos/:id/subtasks/:subtaskId/toggle` | Toggle individual subtask completion | *None* |
| `DELETE` | `/api/todos-batch/completed` | Bulk delete all completed tasks | *None* |
| `POST` | `/api/todos/reset` | Re-seed database with mock dataset | *None* |

---

## 📂 Project Directory Structure

```text
react-website-using-cursor/
├── public/                     # Static icons and assets
├── server/                     # Backend API & Database
│   ├── db.js                   # PostgreSQL pool, schema migration & queries
│   ├── index.js                # Express app, middleware & REST endpoints
│   ├── seedData.js             # Initial mockup data definition
│   ├── testConnection.js       # Diagnostic script for database connectivity
│   └── testCrud.js             # Automated CRUD test suite for PostgreSQL
├── src/                        # Frontend Application
│   ├── assets/                 # SVGs and UI graphics
│   ├── components/             # Reusable React components
│   │   ├── DeleteConfirmModal.jsx # Deletion confirmation dialog
│   │   ├── Navbar.jsx          # Top navigation, theme toggle & DB status badge
│   │   ├── StatsOverview.jsx   # Metrics dashboard & progress bar
│   │   ├── TaskControls.jsx    # Search, category pills, filter tabs & sort
│   │   ├── TodoItem.jsx        # Task card with priority, category & subtasks
│   │   ├── TodoList.jsx        # Task list container & empty states
│   │   └── TodoModal.jsx       # Modal for creating and editing tasks
│   ├── context/
│   │   └── TodoContext.jsx     # Global state management & backend sync
│   ├── data/
│   │   └── mockTodos.js        # Categories, priorities & initial mock data
│   ├── App.jsx                 # Main application layout
│   ├── index.css               # Design system & CSS custom properties (tokens)
│   └── main.jsx                # Application root entry point
├── .env                        # Local environment variables (git-ignored)
├── .env.example                # Sample environment template
├── .gitignore                  # Git ignore rules
├── index.html                  # HTML template with Google Fonts (Plus Jakarta Sans)
├── package.json                # Project dependencies and concurrently scripts
├── README.md                   # Project documentation
└── vite.config.js              # Vite configuration with /api proxy
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended; v20+ supported)
- **npm** (v9 or higher)
- **PostgreSQL** installed locally (or a free cloud database instance from [Neon.tech](https://neon.tech) / [Supabase](https://supabase.com))

---

### 2. Installation
Clone or navigate to the repository and install all dependencies:

```bash
npm install
```

---

### 3. Environment Configuration
Create or edit your [`.env`](file:///.env) file in the project root:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:<YOUR_PASSWORD>@localhost:5432/todo_db
```

> ⚠️ **Important for Passwords with Special Characters**:
> If your PostgreSQL password contains special symbols (such as `#`, `$`, `@`, or `%`), URL-encode them in the connection string:
> - `#` $\rightarrow$ `%23`
> - `$` $\rightarrow$ `%24`
> - `@` $\rightarrow$ `%40`
> 
> *Example*: If your password is `Shreehari#$4698`, use:
> ```env
> DATABASE_URL=postgresql://postgres:Shreehari%23%244698@localhost:5432/todo_db
> ```

---

### 4. Running the Project in One Command

Run **both** the backend server and frontend application simultaneously:

```bash
npm run dev
```

Once executed:
- 🟦 **Backend API**: Running on **[http://localhost:5000](http://localhost:5000)**
- 🟩 **Frontend Web App**: Running on **[http://localhost:5173](http://localhost:5173)**

The browser will automatically connect to the backend, run database migrations, and display the live task manager.

---

### 5. Running Tests
To verify database connectivity and execute the automated Insert, Update, and Delete test suite:

```bash
node server/testCrud.js
```

---

## 🛠️ Available NPM Scripts

| Command | Action |
|---|---|
| `npm run dev` | Runs **both** Express backend and Vite frontend concurrently |
| `npm run client` | Starts only the Vite development server on port `5173` |
| `npm run server` | Starts only the Express.js API on port `5000` |
| `npm run build` | Compiles the production frontend bundle into the `dist/` directory |
| `npm run preview` | Previews the compiled production build locally |

---

## 🎨 Design System & Customization

The styling is built using pure modern CSS tokens defined in [`src/index.css`](file:///src/index.css):
- **Design Tokens**: Standardized variables for backgrounds, borders, shadows, and typography.
- **Theme Variables**: Distinct color palettes for light and dark modes toggleable on the `[data-theme]` attribute.
- **Responsive Layout**: Fluid breakpoints optimized for mobile, tablet, and desktop screens.
- **Typography**: Google Font **Plus Jakarta Sans** with clean fallback hierarchies.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
# react-postgresql-todo-applicaion
