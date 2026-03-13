# Railway Deployment Guide

Complete guide for deploying the NestJS backend to Railway with PostgreSQL database.

## 🚀 Quick Start

### Prerequisites
- Railway account (https://railway.app)
- GitHub repository connected
- Railway CLI (optional): `npm install -g @railway/cli`

---

## 📦 1. Create Railway Project

### Option A: Via Railway Dashboard (Recommended)

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `devmahdi/backend` repository
5. Railway will automatically detect the NestJS app

### Option B: Via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project in backend directory
cd backend
railway init

# Link to GitHub repo
railway link
```

---

## 🗄️ 2. Add PostgreSQL Database

### Via Dashboard

1. In your Railway project, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will automatically provision a PostgreSQL database
3. Database credentials are auto-injected as environment variables:
   - `DATABASE_URL` (connection string)
   - `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

### Via CLI

```bash
railway add --database postgresql
```

---

## 🔧 3. Configure Environment Variables

### Required Environment Variables

Add these via **Railway Dashboard → Variables** or using CLI:

```bash
# Application
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1

# Database (Railway auto-provides these, but you can override)
# DB_HOST will be set from $PGHOST
# DB_PORT will be set from $PGPORT  
# DB_USERNAME will be set from $PGUSER
# DB_PASSWORD will be set from $PGPASSWORD
# DB_NAME will be set from $PGDATABASE
DB_SYNC=false
DB_LOGGING=false

# Redis (optional - add Redis service if needed)
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_TTL=3600

# JWT Authentication (⚠️ CHANGE THESE!)
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_REFRESH_EXPIRATION=7d

# CORS (add your frontend domains)
CORS_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# File Upload
STORAGE_PROVIDER=local
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# S3 Configuration (if using S3)
# AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
# AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=medium-clone-uploads

# Pagination
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100

# Logging
LOG_LEVEL=info
```

### Using Railway CLI

```bash
# Set individual variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Or bulk import from file
railway variables set < .env.production
```

### 🔐 Generate Secure JWT Secrets

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate JWT_REFRESH_SECRET
openssl rand -base64 32
```

Copy these values and add them as Railway environment variables.

---

## 🔌 4. Optional: Add Redis

If you're using caching (recommended):

### Via Dashboard
1. Click **"New"** → **"Database"** → **"Add Redis"**
2. Railway auto-injects: `REDIS_URL`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

### Via CLI
```bash
railway add --database redis
```

---

## ⚙️ 5. Configure Build & Deployment

Railway automatically detects the Dockerfile and builds your app. To customize:

### `railway.json` (already included)

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm run build"
  },
  "deploy": {
    "numReplicas": 1,
    "healthcheckPath": "/api/v1/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "startCommand": "node dist/main"
  }
}
```

### Custom Dockerfile Build

If Railway should use the Dockerfile instead of Nixpacks:

1. Go to **Settings → Build**
2. Select **"Dockerfile"** as Builder
3. Save changes

---

## 🚢 6. Deploy

### Automatic Deployments (Recommended)

Railway automatically deploys on every push to `main` branch.

```bash
git add .
git commit -m "Configure Railway deployment"
git push origin main
```

### Manual Deploy via CLI

```bash
railway up
```

### Check Deployment Status

```bash
# View logs
railway logs

# Check service status
railway status

# Open deployed app
railway open
```

---

## 🩺 7. Health Check Endpoint

The application includes a health check endpoint at:

```
GET /api/v1/health
```

Railway uses this to monitor service health.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-03-13T22:30:00.000Z",
  "uptime": 12345,
  "database": "connected",
  "redis": "connected"
}
```

---

## 📊 8. Monitoring & Logs

### View Logs

**Via Dashboard:**
1. Go to your service
2. Click **"Logs"** tab
3. Filter by severity (info, warn, error)

**Via CLI:**
```bash
# Follow logs in real-time
railway logs --follow

# Filter by error level
railway logs --filter error
```

### Metrics

Railway Dashboard shows:
- CPU usage
- Memory usage
- Network traffic
- Request count
- Response times

---

## 🔄 9. Database Migrations

Run migrations after deployment:

### Option A: Railway CLI

```bash
# Connect to Railway project
railway run npm run migration:run
```

### Option B: Add Migration Script

Create `.github/workflows/railway-migrate.yml`:

```yaml
name: Run Migrations on Deploy

on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Railway CLI
        run: npm install -g @railway/cli
      - name: Run Migrations
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: railway run npm run migration:run
```

### Option C: Add to Build Command

Update `railway.json`:

```json
{
  "build": {
    "buildCommand": "pnpm install && pnpm run build && pnpm run migration:run"
  }
}
```

---

## 🌐 10. Custom Domain (Optional)

### Add Custom Domain

1. Go to **Settings → Networking**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `api.yourdomain.com`)
4. Add the provided CNAME record to your DNS

Railway provides:
- Automatic SSL/TLS certificates
- CDN integration
- DDoS protection

---

## 🔐 11. Security Checklist

- [ ] `DB_SYNC=false` in production (never auto-sync schemas)
- [ ] Strong `JWT_SECRET` and `JWT_REFRESH_SECRET` (32+ characters)
- [ ] `CORS_ORIGINS` restricted to your frontend domains only
- [ ] Rate limiting enabled (`THROTTLE_LIMIT` set appropriately)
- [ ] `LOG_LEVEL=info` or `warn` in production (not `debug`)
- [ ] Database backups enabled (Railway auto-backup)
- [ ] Redis password set (Railway auto-generates)

---

## 🐛 12. Troubleshooting

### Build Fails

**Issue:** `pnpm: command not found`

**Fix:** Ensure `package.json` has:
```json
"engines": {
  "node": ">=20.0.0",
  "pnpm": ">=9.0.0"
}
```

Railway will auto-install pnpm.

---

### Database Connection Fails

**Issue:** `ECONNREFUSED` or `authentication failed`

**Fix:** Check that database variables are correctly mapped:

```bash
railway variables get
```

Ensure Railway's auto-injected Postgres variables are being used.

---

### Health Check Fails

**Issue:** Deployment shows "Unhealthy"

**Fix:** 
1. Check logs: `railway logs`
2. Verify `/api/v1/health` responds with 200
3. Ensure `healthcheckTimeout` in `railway.json` is sufficient (100ms+)

---

### Port Binding Issues

**Issue:** App doesn't respond

**Fix:** Railway auto-injects `PORT` variable. Ensure `main.ts` uses:

```typescript
const port = process.env.PORT || 3000;
await app.listen(port);
```

---

## 📈 13. Scaling

### Vertical Scaling (Increase Resources)

1. Go to **Settings → Resources**
2. Upgrade to a paid plan for more CPU/Memory

### Horizontal Scaling (Multiple Replicas)

Update `railway.json`:

```json
{
  "deploy": {
    "numReplicas": 3
  }
}
```

**Note:** Horizontal scaling requires a paid plan.

---

## 💰 14. Cost Optimization

- **Free Tier:** $5 credit/month (~500 hours runtime)
- **Hobby Plan:** $5/month for unlimited hours
- **Pro Plan:** Usage-based pricing

### Tips to Reduce Costs:
- Use `sleepApplication: true` for non-critical envs
- Optimize database queries (enable logging temporarily to identify slow queries)
- Use caching (Redis) to reduce database load

---

## 📝 15. Rollback

### Via Dashboard
1. Go to **Deployments**
2. Find a previous successful deployment
3. Click **"Redeploy"**

### Via CLI
```bash
# View deployment history
railway status --deployments

# Rollback to specific deployment
railway rollback <deployment-id>
```

---

## 🔗 16. Connect Frontend

Update your frontend's API URL to point to Railway:

```env
# Frontend .env
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app/api/v1
```

Or use a custom domain:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [NestJS Production Best Practices](https://docs.nestjs.com/techniques/performance)
- [PostgreSQL on Railway](https://docs.railway.app/databases/postgresql)

---

## ✅ Deployment Checklist

- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Environment variables configured (especially `JWT_SECRET`, `JWT_REFRESH_SECRET`)
- [ ] CORS origins set to production domains
- [ ] Redis added (if using caching)
- [ ] Health check endpoint verified
- [ ] Database migrations run
- [ ] Custom domain configured (optional)
- [ ] Monitoring/alerting set up
- [ ] SSL certificate active
- [ ] First deployment successful
- [ ] Frontend connected and tested

---

**🎉 Your NestJS backend is now live on Railway!**

Access your API at:
- **API:** `https://your-app.up.railway.app/api/v1`
- **Swagger Docs:** `https://your-app.up.railway.app/api/docs`
- **Health Check:** `https://your-app.up.railway.app/api/v1/health`
