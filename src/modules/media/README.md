# Media Upload Module

This module provides file upload functionality with support for both local storage and AWS S3.

## Features

- ✅ Multiple upload endpoints (avatar, cover, content images)
- ✅ Automatic image optimization with Sharp
- ✅ File validation (type, size, extension)
- ✅ Support for local storage and AWS S3
- ✅ Public URL generation
- ✅ File deletion
- ✅ Swagger/OpenAPI documentation

## Configuration

### Environment Variables

```env
# Storage provider: 'local' or 's3'
STORAGE_PROVIDER=local

# Maximum file size in bytes (default: 5MB)
MAX_FILE_SIZE=5242880

# Local storage directory (only for local provider)
UPLOAD_DIR=./uploads

# AWS S3 configuration (only for s3 provider)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### Switching Storage Providers

To switch from local to S3, simply change the `STORAGE_PROVIDER` environment variable:

```env
# Use local storage
STORAGE_PROVIDER=local

# Use S3 storage
STORAGE_PROVIDER=s3
```

## API Endpoints

### 1. Upload Avatar

**Endpoint:** `POST /api/v1/media/upload/avatar`

Upload a user profile avatar image.

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/media/upload/avatar \
  -F "file=@/path/to/avatar.jpg"
```

**Response:**
```json
{
  "url": "http://localhost:3000/uploads/avatars/abc123-def456.jpg",
  "key": "avatars/abc123-def456.jpg",
  "filename": "abc123-def456.jpg",
  "mimetype": "image/jpeg",
  "size": 102400
}
```

### 2. Upload Cover Image

**Endpoint:** `POST /api/v1/media/upload/cover`

Upload an article cover image.

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/media/upload/cover \
  -F "file=@/path/to/cover.jpg"
```

**Response:**
```json
{
  "url": "http://localhost:3000/uploads/covers/xyz789-abc123.jpg",
  "key": "covers/xyz789-abc123.jpg",
  "filename": "xyz789-abc123.jpg",
  "mimetype": "image/jpeg",
  "size": 256000
}
```

### 3. Upload Content Image

**Endpoint:** `POST /api/v1/media/upload/content`

Upload an in-content image for article body.

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/media/upload/content \
  -F "file=@/path/to/image.png"
```

**Response:**
```json
{
  "url": "http://localhost:3000/uploads/content/img123-456.png",
  "key": "content/img123-456.png",
  "filename": "img123-456.png",
  "mimetype": "image/png",
  "size": 180000
}
```

### 4. Delete File

**Endpoint:** `DELETE /api/v1/media/:key`

Delete an uploaded file by its key.

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/v1/media/avatars/abc123-def456.jpg \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

## File Validation

### Allowed MIME Types

- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/gif`
- `image/webp`
- `image/svg+xml`

### Size Limits

- Default: 5MB (configurable via `MAX_FILE_SIZE`)
- Can be adjusted per environment

### Automatic Processing

All images are automatically:
- Resized to maximum 2000x2000 pixels (maintains aspect ratio)
- Converted to JPEG format
- Compressed with 85% quality
- Given a unique UUID-based filename

## Integration with Other Modules

### User Profiles (Avatar)

```typescript
import { MediaService } from '../media/services/media.service';

@Injectable()
export class UsersService {
  constructor(private mediaService: MediaService) {}

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const uploadResult = await this.mediaService.uploadAvatar(file);
    
    // Update user avatar URL in database
    await this.userRepository.update(userId, {
      avatarUrl: uploadResult.url,
    });

    return uploadResult;
  }
}
```

### Articles (Cover Image)

```typescript
import { MediaService } from '../media/services/media.service';

@Injectable()
export class ArticlesService {
  constructor(private mediaService: MediaService) {}

  async createArticle(dto: CreateArticleDto, coverFile?: Express.Multer.File) {
    let coverImageUrl = null;

    if (coverFile) {
      const uploadResult = await this.mediaService.uploadCoverImage(coverFile);
      coverImageUrl = uploadResult.url;
    }

    const article = this.articleRepository.create({
      ...dto,
      coverImageUrl,
    });

    return this.articleRepository.save(article);
  }
}
```

### Rich Text Editor (In-Content Images)

```typescript
@Post('upload-image')
@UseInterceptors(FileInterceptor('file'))
async uploadEditorImage(@UploadedFile() file: Express.Multer.File) {
  const result = await this.mediaService.uploadContentImage(file);
  
  // Return URL for editor to embed
  return {
    url: result.url,
  };
}
```

## Storage Structure

### Local Storage

```
uploads/
├── avatars/          # User profile pictures
├── covers/           # Article cover images
└── content/          # In-content images
```

### S3 Storage

```
your-bucket/
├── avatars/          # User profile pictures
├── covers/           # Article cover images
└── content/          # In-content images
```

## Error Handling

### Common Errors

**No file provided:**
```json
{
  "statusCode": 400,
  "message": "No file uploaded"
}
```

**File too large:**
```json
{
  "statusCode": 400,
  "message": "File size exceeds maximum allowed size of 5MB"
}
```

**Invalid file type:**
```json
{
  "statusCode": 400,
  "message": "File type not allowed. Allowed types: image/jpeg, image/png, ..."
}
```

**File extension mismatch:**
```json
{
  "statusCode": 400,
  "message": "File extension does not match MIME type"
}
```

## Testing

### Test Upload (curl)

```bash
# Upload avatar
curl -X POST http://localhost:3000/api/v1/media/upload/avatar \
  -F "file=@test-image.jpg" \
  -H "Content-Type: multipart/form-data"

# Upload cover
curl -X POST http://localhost:3000/api/v1/media/upload/cover \
  -F "file=@cover.png"

# Delete file
curl -X DELETE http://localhost:3000/api/v1/media/avatars/file-key.jpg \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Upload (Swagger UI)

1. Navigate to http://localhost:3000/api/docs
2. Find the `/media/upload/avatar` endpoint
3. Click "Try it out"
4. Choose a file
5. Execute

## Production Considerations

### Local Storage

**Pros:**
- No external dependencies
- No additional costs
- Fast uploads
- Simple setup

**Cons:**
- Not scalable horizontally
- Server disk space limited
- No CDN benefits
- Manual backups needed

### S3 Storage

**Pros:**
- Highly scalable
- CDN integration (CloudFront)
- Automatic backups
- Global availability
- No server disk usage

**Cons:**
- Additional AWS costs
- Requires AWS account
- Slightly slower uploads
- External dependency

### Recommendations

- **Development:** Use local storage
- **Production:** Use S3 with CloudFront CDN
- **Small deployments:** Local storage is fine
- **High traffic:** Definitely use S3

## Security Best Practices

1. **Always validate file types** - Done automatically
2. **Limit file sizes** - Configurable via env
3. **Use authentication for delete** - Implement JWT guard
4. **Sanitize filenames** - UUID-based naming prevents injection
5. **Set CORS properly** - Configure in main app module
6. **Use signed URLs for S3** - Available in S3StorageService

## Future Enhancements

- [ ] Support for video uploads
- [ ] Support for PDF documents
- [ ] Image cropping/editing
- [ ] Multiple file uploads
- [ ] Progress tracking for large uploads
- [ ] Thumbnail generation
- [ ] Watermarking
- [ ] Image metadata extraction
- [ ] Virus scanning integration
