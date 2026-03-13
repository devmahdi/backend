# System Architecture & Cross-Repo Conventions

## Overview

This monorepo consists of three interconnected services:

1. **Backend (NestJS)** - API server providing business logic and data management
2. **Frontend (Next.js)** - User-facing web application
3. **Admin (React)** - Administrative dashboard and system management

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                  Load Balancer / Proxy               │
└───────────────┬─────────────────────────────┬───────┘
                │                             │
        ┌───────▼─────────┐        ┌──────────▼────────┐
        │   Frontend      │        │   Admin Panel     │
        │   (Next.js)     │        │   (React)         │
        │   :3000         │        │   :3001           │
        └───────┬─────────┘        └──────────┬────────┘
                │                             │
                └──────────────┬──────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Backend API        │
                    │  (NestJS)           │
                    │  :3002              │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  PostgreSQL DB      │
                    │  Cache (Redis)      │
                    │  File Storage       │
                    └─────────────────────┘
```

## Service Responsibilities

### Backend (NestJS)
- RESTful API endpoints
- Authentication & authorization (JWT)
- Business logic processing
- Database operations
- Email/notification services
- File processing

### Frontend (Next.js)
- Public landing page
- User registration & login
- User dashboard
- Profile management
- Public-facing features
- Server-side rendering (SEO)

### Admin (React)
- User management
- Analytics & reporting
- System configuration
- Role & permission management
- Audit logs
- Internal tools

## API Design

### Base URL Configuration
```
Development:  http://localhost:3002/api
Staging:      https://staging-api.example.com/api
Production:   https://api.example.com/api
```

### API Versioning
- Current version: `v1`
- URLs follow pattern: `/api/v1/{resource}`
- Backward compatibility maintained across minor versions
- Breaking changes require major version bump

### Response Format
```json
{
  "success": true,
  "data": {...},
  "message": "Optional message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Handling
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [...]
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Server Error

## Authentication & Authorization

### Flow
1. User submits credentials
2. Backend validates and returns JWT token
3. Client stores token (secure cookie / localStorage)
4. Token included in `Authorization: Bearer {token}` header
5. Backend validates token on each request

### JWT Payload
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "user|admin|moderator",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Token Expiration
- Access token: 1 hour
- Refresh token: 7 days
- Admin session: 30 minutes (shorter for security)

## Database Schema

### Core Tables
- `users` - User accounts
- `roles` - Role definitions
- `permissions` - Permission definitions
- `user_roles` - User-role mapping
- `audit_logs` - Activity tracking
- `sessions` - Active sessions

### Conventions
- Table names: snake_case, plural
- Column names: snake_case
- Primary key: `id` (UUID)
- Timestamps: `created_at`, `updated_at`, `deleted_at` (soft delete)
- Foreign keys: `{table}_id`

## Environment Configuration

### Shared Variables
```
NODE_ENV=development|staging|production
LOG_LEVEL=debug|info|warn|error
```

### Backend
```
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=secret_key
JWT_EXPIRATION=3600
API_PORT=3002
```

### Frontend
```
NEXT_PUBLIC_API_URL=http://localhost:3002/api
NEXT_PUBLIC_ENVIRONMENT=development
```

### Admin
```
VITE_API_URL=http://localhost:3002/api
VITE_ENVIRONMENT=development
```

## Code Organization

### Naming Conventions
- Components: PascalCase (`UserCard.tsx`)
- Hooks: camelCase starting with `use` (`useAuth.ts`)
- Utils: camelCase (`formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Types: PascalCase (`User.ts`)

### File Structure
```
/src
  /components
    /common      # Shared across pages
    /auth        # Auth-specific
    /layout      # Layout components
  /pages         # Route pages
  /hooks         # Custom hooks
  /utils         # Utilities
  /types         # TypeScript types
  /services      # API/external services
  /store         # State management
```

### Import Organization
```typescript
// 1. External libraries
import React from react;
import { useRouter } from next/router;

// 2. Internal absolute imports
import { UserCard } from @/components/UserCard;
import { useAuth } from @/hooks/useAuth;

// 3. Relative imports
import { helper } from ../utils/helper;
```

## Branching Strategy

### Branch Types
- `main` - Production-ready, protected
- `develop` - Integration branch
- `feature/{issue-number}-{description}` - New features
- `bugfix/{issue-number}-{description}` - Bug fixes
- `hotfix/{issue-number}-{description}` - Production hotfixes
- `docs/{description}` - Documentation only

### Commit Messages
```
type(scope): subject

body (optional)

footer (optional)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(auth): add two-factor authentication

Added TOTP-based 2FA support
- Implement authenticator setup flow
- Add verification middleware
- Update user model with secret field

Closes #42
```

## PR Requirements

### All Repositories
1. ✅ Minimum 1 approval
2. ✅ All status checks passing
3. ✅ No merge conflicts
4. ✅ Code follows style guide
5. ✅ Tests included for new features
6. ✅ Commit history is clean

### Backend
- Database migrations included
- API documentation updated
- Swagger schema validated

### Frontend
- Responsive design tested
- Lighthouse score ≥ 90
- Accessibility checked (WCAG 2.1 AA)
- Cross-browser tested

### Admin
- WCAG 2.1 AA compliance
- Admin-only features properly guarded
- Audit logging implemented

## Testing Strategy

### Backend
- Unit tests: 80%+ coverage
- Integration tests for API endpoints
- Database tests with transactions
- Command: `npm run test`

### Frontend
- Component tests with React Testing Library
- E2E tests with Cypress/Playwright
- Visual regression tests
- Command: `npm run test`

### Admin
- Component tests with React Testing Library
- Permission/role tests
- E2E critical flows
- Command: `npm run test`

## Deployment Pipeline

### Stages
1. **Develop** - Push to develop branch
2. **Staging** - Merge PR to develop (auto-deploy)
3. **Production** - Merge to main (manual approval)

### Checks
- Linting (ESLint, Prettier)
- Type checking (TypeScript)
- Tests (all must pass)
- Build verification
- Security scanning

## Shared Types & Libraries

### Future: Shared Package
When needed, create `@organization/shared-types`:
```typescript
export interface User {
  id: string;
  email: string;
  role: Role;
}

export type Role = "user" | "admin" | "moderator";
```

All repos import from this package for type consistency.

## Communication & Documentation

### Documentation Locations
- **Architecture:** `ARCHITECTURE.md` (this file)
- **API Docs:** `/api/docs` (Swagger)
- **Setup:** `README.md` in each repo
- **Guidelines:** `.github/` folder

### Communication
- GitHub Issues: Task tracking and discussion
- GitHub Discussions: Architectural decisions
- PR Comments: Code review
- Slack: Real-time updates

## Monitoring & Logging

### Logging Standards
```typescript
// Backend
logger.debug("User login attempted", { userId, ip });
logger.error("Database connection failed", { error });

// Frontend (if needed)
console.info("[Auth] User logged in successfully");
console.error("[API] Request failed", error);
```

### Metrics to Track
- API response times
- Error rates
- User authentication success
- Database query performance
- Frontend bundle size

## Security Considerations

### CORS Configuration
```
Frontend: http://localhost:3000
Admin: http://localhost:3001
Backend: http://localhost:3002
Production: https://example.com
```

### Rate Limiting
- Login endpoint: 5 requests per 15 minutes
- API endpoints: 100 requests per minute
- File uploads: 10 per minute per user

### Data Validation
- Input validation on all endpoints
- CSRF protection on state-changing operations
- XSS prevention (sanitize user input)
- SQL injection prevention (prepared statements)

## Version Control

### Git Workflow
1. Clone repo: `git clone {repo-url}`
2. Create branch: `git checkout -b feature/123-description`
3. Commit changes: `git commit -m "feat(scope): description"`
4. Push: `git push origin feature/123-description`
5. Create PR on GitHub
6. Address review feedback
7. Merge when approved

### Keeping Sync
```bash
# Regular sync with main/develop
git fetch origin
git rebase origin/develop
```

## Troubleshooting

### Common Issues

**API not connecting?**
- Check `NEXT_PUBLIC_API_URL` env variable
- Verify backend is running on correct port
- Check CORS configuration

**Database migrations failing?**
- Review migration file syntax
- Verify database connection
- Check for conflicting migrations

**Build failures?**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all env variables set

## Next Steps

1. Follow setup instructions in each repo's README
2. Review API documentation with `/api/docs`
3. Set up development environment locally
4. Create feature branch for first task
5. Submit PR with changes
6. Celebrate! 🎉

