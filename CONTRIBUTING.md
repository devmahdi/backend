# Contributing Guide

Thank you for contributing to the Medium Backend API! This guide ensures consistency across the codebase.

---

## 📋 Code Standards

### **Naming Conventions**

**TypeScript:**
- **Variables/Functions**: `camelCase`
  ```typescript
  const userName = 'John';
  function getUserProfile() { }
  ```
- **Classes/Interfaces**: `PascalCase`
  ```typescript
  class UserService { }
  interface UserProfile { }
  ```
- **Constants**: `UPPER_SNAKE_CASE`
  ```typescript
  const MAX_FILE_SIZE = 5242880;
  const JWT_EXPIRATION = '15m';
  ```

**Database (SQL/TypeORM):**
- **Tables/Columns**: `snake_case`
  ```sql
  users
  user_followers
  created_at
  is_active
  ```

**Files:**
- **Controllers**: `kebab-case.controller.ts` (e.g., `users.controller.ts`)
- **Services**: `kebab-case.service.ts`
- **Entities**: `kebab-case.entity.ts`
- **DTOs**: `kebab-case.dto.ts`

---

## 🔧 Code Formatting

**Run before committing:**
```bash
pnpm run lint
pnpm run format
```

**Prettier Config:**
- Single quotes
- Semicolons
- Trailing commas
- 90 character line width
- 2 space indentation

---

## 🔑 Authentication Flow

**JWT Authentication:**
- **Access Token**: 15 minutes expiry
- **Refresh Token**: 7 days expiry
- **Hashing**: bcrypt (10 rounds)
- **Storage**: Refresh tokens hashed in database

**Endpoints:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`

---

## 🚨 Error Handling

All API errors follow this shape:

```json
{
  "statusCode": 400,
  "message": "Email already exists",
  "error": "Bad Request",
  "timestamp": "2024-03-13T22:00:00.000Z",
  "path": "/api/v1/auth/register"
}
```

**Implementation:**
```typescript
throw new BadRequestException('Email already exists');
```

---

## 📚 API Contract

- Version prefix: `/api/v1/`
- RESTful naming (plural nouns)
- Pagination: `?page=1&limit=20`
- Filtering: `?status=published`
- Sorting: `?sortBy=createdAt&sortOrder=desc`

---

## 🧪 Testing

```bash
pnpm run test              # Run all tests
pnpm run test:watch        # Watch mode
pnpm run test:cov          # Coverage report
```

---

## 🔀 Pull Request Guidelines

**PR Title:**
```
feat(users): add profile update endpoint
fix(auth): resolve token refresh bug
```

**Checklist:**
- [ ] Tests pass
- [ ] Linted and formatted
- [ ] .env.example updated
- [ ] Migration created (if schema change)
- [ ] Swagger docs updated

---

Thank you for contributing! 🎉
