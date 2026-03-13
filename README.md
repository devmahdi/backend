# Medium Clone - Backend API

NestJS-based RESTful API for a Medium-style blogging platform with JWT authentication, TypeORM, PostgreSQL, and Redis.

## 🚀 Features

- ✅ **JWT Authentication** with access & refresh tokens
- ✅ **TypeORM** with PostgreSQL
- ✅ **Redis** for caching
- ✅ **Swagger/OpenAPI** documentation at `/api/docs`
- ✅ **Global exception filter** for consistent error responses
- ✅ **Request/response transformation** interceptors
- ✅ **Request logging** interceptor
- ✅ **CORS** configured for frontend and admin
- ✅ **Rate limiting** (throttler)
- ✅ **Pagination utilities**
- ✅ **Docker Compose** setup
- ✅ **Validation** with class-validator

## 📋 Prerequisites

- Node.js 20+ and pnpm
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (optional)

## 🛠️ Installation

### 1. Clone and Install

```bash
git clone <repository-url>
cd backend
pnpm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=medium

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGINS=http://localhost:3001,http://localhost:3002
```

### 3. Database Setup

#### Option A: Using Docker Compose (Recommended)

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Or start all services including the API
docker-compose up -d
```

#### Option B: Manual Setup

```bash
# Install PostgreSQL and Redis locally
# Create database
createdb medium

# Update .env with connection details
```

### 4. Run the Application

```bash
# Development mode with hot reload
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod
```

The API will be available at:
- **API**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/v1/health

## 📁 Project Structure

```
src/
├── common/                    # Shared utilities
│   ├── decorators/           # Custom decorators
│   ├── dto/                  # Common DTOs (pagination, etc.)
│   ├── filters/              # Exception filters
│   ├── guards/               # Auth guards
│   ├── interceptors/         # Request/response interceptors
│   ├── interfaces/           # TypeScript interfaces
│   └── utils/                # Utility functions
├── modules/                  # Feature modules
│   ├── auth/                 # Authentication module
│   ├── users/                # User management
│   ├── articles/             # Article CRUD
│   ├── comments/             # Comments system
│   ├── tags/                 # Tag management
│   ├── claps/                # Article clapping
│   ├── bookmarks/            # Bookmark system
│   ├── feed/                 # Content feed
│   ├── media/                # File uploads
│   └── stats/                # Analytics (admin)
├── app.module.ts             # Root module
└── main.ts                   # Application entry point
```

## 🔌 API Documentation

Once the application is running, visit **http://localhost:3000/api/docs** for interactive Swagger documentation.

### Standard Response Format

All endpoints follow this response structure:

#### Success Response
```json
{
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  },
  "error": null
}
```

#### Error Response
```json
{
  "data": null,
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/users",
    "method": "POST"
  },
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed",
    "details": [...]
  }
}
```

### Pagination

List endpoints support pagination via query parameters:

```
GET /api/v1/articles?page=1&limit=20
```

Response includes pagination metadata:

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## 🔐 Authentication

The API uses JWT-based authentication:

1. **Register/Login** → Receive access token (15min) + refresh token (7d)
2. **Include token** in Authorization header: `Bearer <token>`
3. **Refresh** using refresh token when access token expires

### Example Flow

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Use access token
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# e2e tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run start` | Start the application |
| `pnpm run start:dev` | Start with hot reload (development) |
| `pnpm run start:prod` | Start in production mode |
| `pnpm run build` | Build for production |
| `pnpm run lint` | Lint the codebase |
| `pnpm run format` | Format code with Prettier |
| `pnpm run test` | Run unit tests |
| `pnpm run test:e2e` | Run end-to-end tests |

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `NODE_ENV` - Application environment (development/production)
- `PORT` - Server port
- `DB_*` - Database configuration
- `REDIS_*` - Redis configuration
- `JWT_SECRET` - Secret for JWT tokens
- `CORS_ORIGINS` - Allowed CORS origins

### Database Migrations

```bash
# Generate migration
pnpm run migration:generate -- -n MigrationName

# Run migrations
pnpm run migration:run

# Revert migration
pnpm run migration:revert
```

## 🚀 Deployment

### Railway (Recommended)

1. Connect your GitHub repository to Railway
2. Add environment variables from `.env.example`
3. Railway will automatically detect and deploy

### Manual Deployment

```bash
# Build
pnpm run build

# Set production environment variables

# Start production server
NODE_ENV=production pnpm run start:prod
```

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Swagger/OpenAPI Specification](https://swagger.io/specification/)

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT

---

Built with ❤️ using NestJS
