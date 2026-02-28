# Log Analyzer

A full-stack web application for uploading, parsing, analyzing, and visualizing system logs from Windows and Linux environments. Features AI-powered chat analysis, interactive dashboards, and enterprise-grade security.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

### Log Management
- **Multi-OS Support** — Parse Windows Event Logs (CSV) and Linux logs (syslog, auth.log, kernel.log)
- **Drag & Drop Upload** — Upload log files with validation, progress tracking, and error feedback
- **Search & Filter** — Full-text search with severity, log type, OS, and date range filters
- **Export** — Download filtered logs as CSV or JSON (up to 10,000 records)
- **Delete** — Single and bulk delete with filter-based mass deletion

### Analytics Dashboard
- **Overview Cards** — Total logs, errors, warnings, and critical events with sparkline trends
- **Log Type Distribution** — Interactive pie chart showing syslog, Windows, auth, kernel breakdown
- **Severity Bar Chart** — Monthly stacked bar chart of INFO/WARNING/ERROR/CRITICAL over 7 months
- **Data Grid** — Sortable, filterable table with pagination, row selection, and click-to-inspect

### AI Chat
- **Gemini-Powered Analysis** — Ask questions about specific log entries using Google Gemini AI
- **Context-Aware** — Chat references the selected log entry for targeted analysis
- **Markdown Rendering** — AI responses rendered with syntax highlighting and code blocks
- **Conversation History** — Per-log chat history with copy and regenerate actions

### Security & Auth
- **Clerk Authentication** — User sign-up/sign-in with session management
- **Data Isolation** — All queries scoped to the authenticated user's `ownerId`
- **Helmet** — HTTP security headers
- **Rate Limiting** — 100 requests per 15 minutes per IP
- **Mongo Sanitize** — Protection against NoSQL injection
- **CORS** — Configurable cross-origin policy

### Infrastructure
- **Redis Caching** — Configurable TTL-based response caching with pattern invalidation
- **Bull Queues** — Background job processing for log parsing (Redis-backed)
- **MongoDB Indexes** — Compound indexes on ownerId + severity, logType, timestamp for fast queries
- **Docker Compose** — One-command deployment with frontend, backend, and MongoDB services
- **Winston Logging** — Structured logging with file and console transports

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite, Material UI v7, MUI X (DataGrid, Charts, DatePickers), Recoil, React Router v7, Clerk React, TailwindCSS v4 |
| **Backend** | Node.js, Express, TypeScript, Mongoose, Clerk Express, Google Generative AI, ioredis, Bull, Multer, Winston, Zod |
| **Database** | MongoDB |
| **Cache/Queue** | Redis |
| **Infrastructure** | Docker, Docker Compose |

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) & [Docker Compose](https://docs.docker.com/compose/install/) (for containerized setup)
- Node.js 22+ and npm (for local development)
- MongoDB instance (local or Atlas)
- Redis instance (optional, for caching/queues)

### Quick Start with Docker

```bash
git clone https://github.com/dineshsutihar/Log-Analyzer.git
cd Log-Analyzer
docker-compose up --build
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

### Local Development

1. **Set up environment variables**

   Copy the example files and fill in your values:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

   **Backend `.env`**:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/loganalyzer
   CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   GOOGLE_API_KEY=your_gemini_api_key
   REDIS_HOST=localhost
   REDIS_PORT=6379
   FRONTEND_URL=http://localhost:5173
   ```

   **Frontend `.env`**:
   ```env
   VITE_BACKEND_URL=http://localhost:3000
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

2. **Install dependencies**

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Start development servers**

   ```bash
   # Terminal 1 — Backend
   cd backend && npm run dev

   # Terminal 2 — Frontend
   cd frontend && npm run dev
   ```

## API Reference

All endpoints require a valid Clerk Bearer token in the `Authorization` header.

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload a log file (CSV for Windows, LOG for Linux). Multipart form: `logfile` + `source` |

### Stats & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | Dashboard statistics (total logs, errors, warnings, critical counts with trends) |
| `GET` | `/api/getLogAnalytics` | All logs for the authenticated user |
| `GET` | `/api/logtypeStatus` | Log type distribution (syslog, Windows, auth, kernel, unknown counts) |
| `GET` | `/api/severityInfo` | Monthly severity breakdown over the last 7 months |

### Log Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/logs/search` | Search with filters: `q`, `severity`, `logType`, `os`, `startDate`, `endDate`, `page`, `limit`, `sortBy`, `sortOrder` |
| `GET` | `/api/logs/export?format=csv` | Export filtered logs as CSV or JSON |
| `GET` | `/api/logs/:id` | Get a single log by ID |
| `DELETE` | `/api/logs/:id` | Delete a single log |
| `DELETE` | `/api/logs` | Bulk delete by `ids` array or `deleteAll` with filters |

### AI Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send a message about a log entry. Body: `{ logId, userText }` |

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express app entry point
│   │   ├── db/
│   │   │   ├── connect.ts        # MongoDB connection
│   │   │   └── indexes.ts        # Database index creation
│   │   ├── middleware/
│   │   │   ├── cacheMiddleware.ts # Redis cache middleware
│   │   │   ├── errorHandler.ts   # Global error handler
│   │   │   ├── security.ts       # Helmet, rate-limit, sanitize
│   │   │   └── validation.ts     # Zod request validation
│   │   ├── models/
│   │   │   └── UnifiedLogModel.ts # Mongoose schema
│   │   ├── routes/
│   │   │   ├── upload.ts         # File upload & parsing
│   │   │   ├── getAllLogs.ts     # Get all user logs
│   │   │   ├── getStats.ts      # Dashboard statistics
│   │   │   ├── getLogAnalytics.ts # Log analytics data
│   │   │   ├── logTypeStatus.ts  # Log type distribution
│   │   │   ├── severityInfo.ts   # Severity breakdown
│   │   │   ├── logManagement.ts  # Search, export, delete
│   │   │   └── chat.ts          # AI chat endpoint
│   │   └── utils/
│   │       ├── cache.ts          # Redis CacheService
│   │       ├── logParser.ts      # Log parsing factory
│   │       ├── parse-window.ts   # Windows CSV parser
│   │       ├── parse-linux.ts    # Linux log parsers
│   │       └── severityInfer.ts  # Severity classification
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Landing page
│   │   ├── main.jsx              # React root with providers
│   │   ├── components/
│   │   │   ├── Dashboard.jsx     # Main dashboard layout
│   │   │   ├── MainGrid.jsx      # Overview cards grid
│   │   │   ├── Analytics.jsx     # Log analytics with filters
│   │   │   ├── CustomizedDataGrid.jsx # Log data table
│   │   │   ├── Chat.jsx          # AI chat interface
│   │   │   ├── Upload.jsx        # File upload form
│   │   │   ├── LogDetailsDialog.jsx # Log detail overlay
│   │   │   ├── StatCard.jsx      # Dashboard stat card
│   │   │   ├── LogTypeStatus.jsx # Pie chart component
│   │   │   └── LogAnalyzedBarGraph.jsx # Bar chart
│   │   ├── utils/
│   │   │   ├── api/
│   │   │   │   ├── apiClient.js  # Centralized API client
│   │   │   │   ├── logManagement.js # Search/export/delete
│   │   │   │   └── ...           # Other API clients
│   │   │   └── state.js          # Recoil atoms
│   │   └── theme/                # MUI theme customizations
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Docker Volumes

The project uses a Docker volume `mongodb_data` for MongoDB persistence:

```bash
docker volume ls                  # View volumes
docker volume rm mongodb_data     # Remove (deletes all data)
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Container won't start | Check `docker-compose logs <service>` for errors |
| Auth errors | Verify Clerk keys match in both frontend and backend `.env` |
| No data in dashboard | Upload a log file first via the Upload page |
| Redis connection refused | Redis is optional — the app works without it (caching disabled) |
| Build fails | Ensure Node.js 22+ and run `npm install` in both `backend/` and `frontend/` |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
