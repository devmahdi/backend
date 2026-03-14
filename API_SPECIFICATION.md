# API Specification - Medium Clone Blog Platform

**Version:** 1.0  
**Base URL:** `https://medium-clone-backend.up.railway.app/api/v1`  
**Documentation:** https://medium-clone-backend.up.railway.app/api/docs  
**Status:** ✅ 25+ Endpoints Implemented

---

## Authentication

### `POST /auth/register`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securePassword123",
  "fullName": "John Doe"
}
```

**Response (201):**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "fullName": "John Doe",
    "role": "reader"
  }
}
```

**Validations:**
- Email format validation
- Username: 3-50 chars, alphanumeric + underscores
- Password: min 8 characters

---

### `POST /auth/login`
Authenticate user with email/username and password.

**Request:**
```json
{
  "identifier": "user@example.com",  // or username
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "fullName": "John Doe",
    "role": "admin"
  }
}
```

**Error (401):**
```json
{
  "message": "Invalid credentials",
  "statusCode": 401
}
```

---

### `POST /auth/refresh`
Refresh access token using refresh token.

**Request Headers:**
```
Authorization: Bearer {refreshToken}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

---

### `POST /auth/change-password`
Change user password (requires authentication).

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error (401):**
```json
{
  "message": "Current password is incorrect",
  "statusCode": 401
}
```

---

## Users

### `GET /users/:username`
Get user profile by username.

**Path Parameters:**
- `username` (string) - Username to fetch

**Response (200):**
```json
{
  "id": "uuid",
  "username": "johndoe",
  "fullName": "John Doe",
  "email": "user@example.com",
  "bio": "Software developer and writer",
  "avatarUrl": "https://example.com/avatar.jpg",
  "coverUrl": "https://example.com/cover.jpg",
  "website": "https://johndoe.com",
  "twitter": "@johndoe",
  "github": "johndoe",
  "followersCount": 150,
  "followingCount": 45,
  "articlesCount": 12,
  "role": "author",
  "isAdmin": false,
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

---

### `PATCH /users/profile`
Update user profile (requires authentication).

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body (partial):**
```json
{
  "fullName": "Jane Doe",
  "bio": "Updated bio",
  "website": "https://janedoe.com",
  "twitter": "@janedoe",
  "github": "janedoe",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "coverUrl": "https://example.com/new-cover.jpg"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "username": "janedoe",
  "fullName": "Jane Doe",
  "bio": "Updated bio",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "website": "https://janedoe.com",
  "twitter": "@janedoe",
  "github": "janedoe"
}
```

---

### `POST /users/follow/:userId`
Follow a user (requires authentication).

**Path Parameters:**
- `userId` (string) - User ID to follow

**Response (201):**
```json
{
  "message": "User followed successfully",
  "following": true
}
```

**Error (400):**
```json
{
  "message": "Cannot follow yourself",
  "statusCode": 400
}
```

---

### `DELETE /users/follow/:userId`
Unfollow a user (requires authentication).

**Path Parameters:**
- `userId` (string) - User ID to unfollow

**Response (200):**
```json
{
  "message": "User unfollowed successfully",
  "following": false
}
```

---

### `GET /users/followers/:username`
Get followers of a user.

**Path Parameters:**
- `username` (string) - Username

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 20, max: 100) - Items per page

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "username": "follower1",
      "fullName": "Follower One",
      "avatarUrl": "https://example.com/avatar.jpg",
      "bio": "I follow people"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNextPage": true
  }
}
```

---

### `GET /users/following/:username`
Get users that a user is following.

**Path Parameters:**
- `username` (string) - Username

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 20, max: 100) - Items per page

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "username": "author1",
      "fullName": "Author One",
      "avatarUrl": "https://example.com/avatar.jpg",
      "bio": "I write about tech"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNextPage": true
  }
}
```

---

## Feed

### `GET /feed/personalized`
Get personalized feed from authors you follow (requires authentication).

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 20, max: 100) - Items per page
- `tag` (string, optional) - Filter by tag
- `dateFrom` (ISO 8601, optional) - Start date
- `dateTo` (ISO 8601, optional) - End date

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Understanding TypeScript",
      "subtitle": "A complete guide",
      "excerpt": "TypeScript adds type safety...",
      "coverImageUrl": "https://example.com/cover.jpg",
      "slug": "understanding-typescript",
      "status": "published",
      "publishedAt": "2024-03-14T10:00:00.000Z",
      "viewCount": 1250,
      "likeCount": 84,
      "commentCount": 23,
      "readingTimeMinutes": 5,
      "tags": ["typescript", "programming"],
      "author": {
        "id": "uuid",
        "username": "johndoe",
        "fullName": "John Doe",
        "bio": "Software developer",
        "avatarUrl": "https://example.com/avatar.jpg"
      },
      "createdAt": "2024-03-14T09:30:00.000Z",
      "updatedAt": "2024-03-14T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

### `GET /feed/explore`
Get global feed with sorting options (public).

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 20, max: 100) - Items per page
- `sortBy` (enum: "recent", "popular", "trending", default: "recent") - Sort strategy
- `tag` (string, optional) - Filter by tag
- `dateFrom` (ISO 8601, optional) - Start date
- `dateTo` (ISO 8601, optional) - End date

**Sorting Strategies:**
- `recent` - Chronological order (newest first)
- `popular` - All-time engagement score
- `trending` - Recent posts with high engagement (time-decay)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Building Scalable APIs",
      "subtitle": "Best practices for production",
      "excerpt": "When building APIs at scale...",
      "coverImageUrl": "https://example.com/cover.jpg",
      "slug": "building-scalable-apis",
      "status": "published",
      "publishedAt": "2024-03-14T10:00:00.000Z",
      "viewCount": 3450,
      "likeCount": 245,
      "commentCount": 67,
      "readingTimeMinutes": 8,
      "tags": ["api", "backend", "performance"],
      "author": {
        "id": "uuid",
        "username": "janedoe",
        "fullName": "Jane Doe",
        "bio": "Backend engineer",
        "avatarUrl": "https://example.com/avatar.jpg"
      },
      "createdAt": "2024-03-14T09:30:00.000Z",
      "updatedAt": "2024-03-14T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1240,
    "page": 1,
    "limit": 20,
    "totalPages": 62,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## Comments

### `POST /comments/articles/:articleId`
Create a top-level comment on an article (requires authentication).

**Path Parameters:**
- `articleId` (string) - Article ID

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "content": "Great article! I learned a lot."
}
```

**Validations:**
- Content: 1-5000 characters

**Response (201):**
```json
{
  "id": "uuid",
  "content": "Great article! I learned a lot.",
  "status": "approved",
  "likeCount": 0,
  "isEdited": false,
  "createdAt": "2024-03-14T10:00:00.000Z",
  "updatedAt": "2024-03-14T10:00:00.000Z",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "fullName": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg"
  },
  "canEdit": true,
  "canDelete": true,
  "replies": []
}
```

---

### `POST /comments/:commentId/reply`
Reply to a comment (nested, requires authentication).

**Path Parameters:**
- `commentId` (string) - Parent comment ID

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "content": "I totally agree with this point!"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "content": "I totally agree with this point!",
  "status": "approved",
  "likeCount": 0,
  "isEdited": false,
  "createdAt": "2024-03-14T10:05:00.000Z",
  "updatedAt": "2024-03-14T10:05:00.000Z",
  "user": {
    "id": "uuid",
    "username": "janedoe",
    "fullName": "Jane Doe",
    "avatarUrl": "https://example.com/avatar.jpg"
  },
  "canEdit": true,
  "canDelete": true,
  "replies": []
}
```

---

### `GET /comments/articles/:articleId`
Get all comments for an article with nested tree structure (public).

**Path Parameters:**
- `articleId` (string) - Article ID

**Response (200):**
```json
{
  "comments": [
    {
      "id": "comment-1",
      "content": "Great article!",
      "status": "approved",
      "likeCount": 5,
      "isEdited": false,
      "user": {
        "id": "uuid",
        "username": "johndoe",
        "fullName": "John Doe",
        "avatarUrl": "https://example.com/avatar.jpg"
      },
      "canEdit": false,
      "canDelete": false,
      "replies": [
        {
          "id": "comment-2",
          "content": "I agree!",
          "status": "approved",
          "likeCount": 2,
          "isEdited": false,
          "user": {
            "id": "uuid",
            "username": "janedoe",
            "fullName": "Jane Doe",
            "avatarUrl": "https://example.com/avatar.jpg"
          },
          "canEdit": false,
          "canDelete": false,
          "replies": [
            {
              "id": "comment-3",
              "content": "Me too!",
              "status": "approved",
              "likeCount": 1,
              "isEdited": false,
              "replies": []
            }
          ]
        }
      ]
    }
  ],
  "total": 1
}
```

---

### `PATCH /comments/:id`
Update comment content (requires authentication, owner or admin only).

**Path Parameters:**
- `id` (string) - Comment ID

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "content": "Updated comment text [Edited]"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "content": "Updated comment text [Edited]",
  "status": "approved",
  "likeCount": 5,
  "isEdited": true,
  "updatedAt": "2024-03-14T10:10:00.000Z",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "fullName": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg"
  },
  "canEdit": true,
  "canDelete": true
}
```

**Error (403):**
```json
{
  "message": "You can only edit your own comments",
  "statusCode": 403
}
```

---

### `DELETE /comments/:id`
Delete comment (soft delete, requires authentication, owner or admin only).

**Path Parameters:**
- `id` (string) - Comment ID

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "message": "Comment deleted successfully",
  "id": "uuid"
}
```

**Error (403):**
```json
{
  "message": "You can only delete your own comments",
  "statusCode": 403
}
```

---

## Claps

### `POST /claps/articles/:articleId`
Add claps to an article (1-50 max, requires authentication).

**Path Parameters:**
- `articleId` (string) - Article ID

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "count": 25
}
```

**Validations:**
- Count: 1-50 per user per article

**Response (200):**
```json
{
  "message": "Claps added successfully",
  "article": {
    "id": "uuid",
    "likeCount": 125
  },
  "userClaps": 25
}
```

**Error (400):**
```json
{
  "message": "Maximum 50 claps per article",
  "statusCode": 400
}
```

---

### `GET /claps/articles/:articleId`
Get clap information for an article (public).

**Path Parameters:**
- `articleId` (string) - Article ID

**Response (200):**
```json
{
  "articleId": "uuid",
  "totalClaps": 245,
  "clapCount": 12,  // Number of users who clapped
  "userClaps": 0    // Current user's claps (if authenticated)
}
```

---

## Bookmarks

### `POST /bookmarks`
Save an article to bookmarks (requires authentication).

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "postId": "article-uuid"
}
```

**Response (201):**
```json
{
  "message": "Article bookmarked successfully",
  "bookmarkId": "uuid",
  "postId": "article-uuid"
}
```

**Error (400):**
```json
{
  "message": "Article already bookmarked",
  "statusCode": 400
}
```

---

### `DELETE /bookmarks/:articleId`
Remove article from bookmarks (requires authentication).

**Path Parameters:**
- `articleId` (string) - Article ID

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "message": "Bookmark removed successfully",
  "postId": "article-uuid"
}
```

---

### `GET /bookmarks`
Get user's bookmarked articles (requires authentication, paginated).

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 20, max: 100) - Items per page

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Article Title",
      "subtitle": "Subtitle",
      "excerpt": "Article excerpt...",
      "coverImageUrl": "https://example.com/cover.jpg",
      "slug": "article-title",
      "status": "published",
      "publishedAt": "2024-03-14T10:00:00.000Z",
      "viewCount": 500,
      "likeCount": 25,
      "commentCount": 8,
      "readingTimeMinutes": 5,
      "tags": ["tag1", "tag2"],
      "author": {
        "id": "uuid",
        "username": "author",
        "fullName": "Author Name",
        "avatarUrl": "https://example.com/avatar.jpg"
      },
      "createdAt": "2024-03-14T09:30:00.000Z",
      "updatedAt": "2024-03-14T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## Media

### `POST /media/upload`
Upload files (avatar, cover, content images, requires authentication).

**Request Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Form Fields:**
- `file` (file) - File to upload
- `type` (string) - "avatar", "cover", or "content"

**Supported Formats:**
- Images: JPG, PNG, GIF, WebP
- Documents: PDF
- **Max Size:** 5MB

**Response (201):**
```json
{
  "id": "uuid",
  "filename": "image.jpg",
  "url": "https://example.com/files/uuid-image.jpg",
  "mimeType": "image/jpeg",
  "size": 245680,
  "uploadedBy": {
    "id": "uuid",
    "username": "johndoe"
  },
  "createdAt": "2024-03-14T10:00:00.000Z"
}
```

**Error (413):**
```json
{
  "message": "File too large (max 5MB)",
  "statusCode": 413
}
```

---

### `GET /media/:fileId`
Download or view uploaded file (public).

**Path Parameters:**
- `fileId` (string) - File ID

**Response:** File download/view

---

## Admin

### `GET /admin/stats/overview`
Get platform overview statistics (admin-only).

**Request Headers:**
```
Authorization: Bearer {adminToken}
```

**Response (200):**
```json
{
  "overview": {
    "totalUsers": 1250,
    "totalArticles": 340,
    "totalComments": 1560,
    "totalClaps": 8420,
    "totalViews": 45230
  },
  "usersByRole": [
    { "role": "reader", "count": 1100 },
    { "role": "author", "count": 140 },
    { "role": "admin", "count": 10 }
  ],
  "articlesByStatus": [
    { "status": "published", "count": 280 },
    { "status": "draft", "count": 50 },
    { "status": "archived", "count": 10 }
  ],
  "topContent": {
    "mostViewed": [
      {
        "id": "uuid",
        "title": "Top Article",
        "viewCount": 5000,
        "author": { "username": "topauthor" }
      }
    ],
    "mostClapped": [
      {
        "id": "uuid",
        "title": "Popular Article",
        "likeCount": 450,
        "author": { "username": "popauthor" }
      }
    ],
    "mostCommented": [
      {
        "id": "uuid",
        "title": "Discussed Article",
        "commentCount": 120,
        "author": { "username": "discussedauthor" }
      }
    ]
  }
}
```

---

### `GET /admin/stats/growth`
Get growth metrics over time (admin-only).

**Request Headers:**
```
Authorization: Bearer {adminToken}
```

**Query Parameters:**
- `period` (enum: "day", "week", "month", default: "day") - Time grouping
- `startDate` (ISO 8601, default: 30 days ago) - Start date
- `endDate` (ISO 8601, default: now) - End date

**Response (200):**
```json
{
  "period": "day",
  "startDate": "2024-02-13T00:00:00.000Z",
  "endDate": "2024-03-14T23:59:59.999Z",
  "users": [
    { "date": "2024-02-13T00:00:00.000Z", "count": 8 },
    { "date": "2024-02-14T00:00:00.000Z", "count": 12 },
    { "date": "2024-02-15T00:00:00.000Z", "count": 5 }
  ],
  "articles": [
    { "date": "2024-02-13T00:00:00.000Z", "count": 3 },
    { "date": "2024-02-14T00:00:00.000Z", "count": 5 }
  ],
  "comments": [
    { "date": "2024-02-13T00:00:00.000Z", "count": 45 }
  ],
  "claps": [
    { "date": "2024-02-13T00:00:00.000Z", "count": 120 }
  ]
}
```

---

### `GET /admin/stats/articles/:id`
Get detailed analytics for a specific article (admin-only).

**Path Parameters:**
- `id` (string) - Article ID

**Request Headers:**
```
Authorization: Bearer {adminToken}
```

**Response (200):**
```json
{
  "article": {
    "id": "uuid",
    "title": "Building Scalable Systems",
    "slug": "building-scalable-systems",
    "status": "published",
    "publishedAt": "2024-03-01T10:00:00.000Z",
    "viewCount": 2150,
    "likeCount": 180,
    "commentCount": 45,
    "readingTimeMinutes": 8,
    "author": {
      "id": "uuid",
      "username": "sysadmin",
      "fullName": "System Admin"
    }
  },
  "engagement": {
    "totalViews": 2150,
    "totalClaps": 180,
    "totalComments": 45,
    "averageClapsPerUser": 18
  },
  "timeline": {
    "commentsByDate": [
      { "date": "2024-03-01T00:00:00.000Z", "count": 12 },
      { "date": "2024-03-02T00:00:00.000Z", "count": 8 }
    ],
    "clapsByDate": [
      { "date": "2024-03-01T00:00:00.000Z", "count": 50 },
      { "date": "2024-03-02T00:00:00.000Z", "count": 35 }
    ]
  },
  "topEngagers": {
    "clappers": [
      {
        "userId": "uuid",
        "username": "fan1",
        "fullName": "Enthusiastic Reader",
        "avatarUrl": "https://example.com/avatar.jpg",
        "claps": 35
      }
    ],
    "commenters": [
      {
        "userId": "uuid",
        "username": "commenter1",
        "fullName": "Active Commenter",
        "avatarUrl": "https://example.com/avatar.jpg",
        "comments": 8
      }
    ]
  }
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Error message describing what went wrong",
  "error": "BadRequest"
}
```

### Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (auth required or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (resource already exists) |
| 422 | Unprocessable Entity (validation error) |
| 500 | Internal Server Error |

---

## Authentication

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer {accessToken}
```

Access tokens expire after 1 hour. Use the refresh token to obtain a new access token:

```
POST /auth/refresh
Authorization: Bearer {refreshToken}
```

---

## Rate Limiting

API endpoints are rate-limited:
- **Default:** 100 requests per minute per IP
- **Login:** 5 requests per 15 minutes
- **Register:** 10 requests per hour

Rate limit info is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1710425400
```

---

## Pagination

Paginated endpoints use consistent format:

**Query Parameters:**
- `page` (default: 1) - Page number (1-indexed)
- `limit` (default: 20, max: 100) - Items per page

**Response Meta:**
```json
{
  "meta": {
    "total": 1250,        // Total items
    "page": 1,             // Current page
    "limit": 20,           // Items per page
    "totalPages": 63,      // Total pages
    "hasNextPage": true,   // Has next page
    "hasPreviousPage": false  // Has previous page
  }
}
```

---

## Status: ✅ Complete

All 25+ API endpoints are implemented and tested!

**Last Updated:** March 14, 2025  
**Environment:** Production (Railway + Vercel)  
**Documentation:** https://medium-clone-backend.up.railway.app/api/docs
