# 🔧 Railway Deployment Troubleshooting

Common issues and solutions when deploying NestJS backend to Railway.

---

## Build Errors

### ❌ "pnpm: command not found"

**Cause:** Railway didn't detect pnpm as package manager.

**Solution 1:** Ensure `package.json` has engines field:
```json
"engines": {
  "node": ">=20.0.0",
  "pnpm": ">=9.0.0"
}
```

**Solution 2:** Set custom build command:
1. Go to Railway Dashboard → Settings → Build
2. Set Build Command:
   ```bash
   npm install -g pnpm && pnpm install && pnpm run build
   ```

---

### ❌ "Nixpacks build failed"

**Cause:** Railway's Nixpacks builder encountered an issue.

**Solution:** Switch to Dockerfile builder:
1. Go to Railway Dashboard → Settings → Build
2. Set Builder: **Dockerfile**
3. Redeploy

---

### ❌ "Module not found" during build

**Cause:** Dependencies missing or wrong `NODE_ENV`.

**Solution:**
```bash
# Ensure all dependencies are installed
railway run pnpm install --frozen-lockfile

# Check if NODE_ENV is set correctly
railway variables get NODE_ENV  # Should be "production"
```

---

## Database Connection Errors

### ❌ "ECONNREFUSED" or "Connection timeout"

**Cause:** PostgreSQL service not added or not ready.

**Solution:**
```bash
# Add PostgreSQL if missing
railway add --database postgresql

# Check database variables are injected
railway variables | grep -E "PG|DATABASE"

# Wait 30-60 seconds for database to initialize
```

---

### ❌ "authentication failed for user"

**Cause:** Database credentials mismatch.

**Solution:**
```bash
# Check Railway auto-injected variables are used
railway variables get

# Ensure your code uses Railway's variables:
DB_HOST=${PGHOST}
DB_PORT=${PGPORT}
DB_USERNAME=${PGUSER}
DB_PASSWORD=${PGPASSWORD}
DB_NAME=${PGDATABASE}
```

---

### ❌ "Too many connections"

**Cause:** Connection pool exhausted.

**Solution:** Update TypeORM config in `src/database/data-source.ts`:
```typescript
{
  ...
  extra: {
    max: 10,  // Reduce max connections
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
}
```

---

## Health Check Errors

### ❌ "Health check failed" in Railway dashboard

**Cause:** Health endpoint not responding or takes too long.

**Solution 1:** Increase health check timeout in `railway.json`:
```json
{
  "deploy": {
    "healthcheckPath": "/api/v1/health",
    "healthcheckTimeout": 300  // Increase to 300ms
  }
}
```

**Solution 2:** Test health endpoint locally:
```bash
# Check if endpoint responds
curl http://localhost:3000/api/v1/health

# Should return:
# { "status": "ok", "timestamp": "...", "database": "connected" }
```

**Solution 3:** Check logs for startup errors:
```bash
railway logs --filter error
```

---

### ❌ Health endpoint returns 404

**Cause:** API prefix misconfiguration.

**Solution:** Ensure `API_PREFIX` matches your route:
```bash
# Check variable
railway variables get API_PREFIX  # Should be "api/v1"

# Health check path in railway.json should match
healthcheckPath: "/api/v1/health"
```

---

## Deployment Errors

### ❌ "Port already in use"

**Cause:** Application not using Railway's `PORT` variable.

**Solution:** Update `src/main.ts`:
```typescript
const port = process.env.PORT || 3000;
await app.listen(port, '0.0.0.0');  // Must bind to 0.0.0.0
console.log(`Application is running on port ${port}`);
```

---

### ❌ "Application keeps restarting"

**Cause:** Crash loop due to unhandled error.

**Solution:**
```bash
# Check crash logs
railway logs --filter error

# Common causes:
# 1. Missing environment variable
railway variables

# 2. Database not ready (add health check retry logic)
# 3. Unhandled promise rejection
```

---

### ❌ "Build succeeds but app doesn't start"

**Cause:** Start command incorrect.

**Solution:** Check `railway.json`:
```json
{
  "deploy": {
    "startCommand": "node dist/main"  // Ensure this matches your build output
  }
}
```

Or verify with:
```bash
# Test locally
pnpm run build
node dist/main
```

---

## Environment Variable Issues

### ❌ "JWT_SECRET not defined"

**Cause:** Environment variable not set.

**Solution:**
```bash
# Set JWT secrets
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Verify
railway variables get JWT_SECRET
```

---

### ❌ "CORS error from frontend"

**Cause:** Frontend domain not whitelisted.

**Solution:**
```bash
# Update CORS_ORIGINS with your actual domains
railway variables set CORS_ORIGINS="https://yourdomain.com,https://admin.yourdomain.com"

# Verify
railway variables get CORS_ORIGINS
```

---

## Redis Connection Errors

### ❌ "Redis connection refused"

**Cause:** Redis service not added.

**Solution:**
```bash
# Add Redis service
railway add --database redis

# Check Redis variables
railway variables | grep REDIS

# Ensure your app uses these variables
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
REDIS_PASSWORD=${REDIS_PASSWORD}
```

---

### ❌ "Redis NOAUTH"

**Cause:** Redis password not provided.

**Solution:**
```bash
# Railway auto-injects REDIS_PASSWORD
railway variables get REDIS_PASSWORD

# Ensure your Redis config uses it
```

---

## Migration Errors

### ❌ "Migrations fail to run"

**Cause:** Database schema out of sync or migrations not found.

**Solution:**
```bash
# Check dist/database/migrations exists
railway run ls -la dist/database/migrations

# If missing, ensure migrations are copied during build
# Update tsconfig.json to include migrations
```

**Alternative:** Run migrations manually after deploy:
```bash
railway run pnpm run migration:run
```

---

### ❌ "Migration already applied"

**Cause:** Migrations ran multiple times.

**Solution:**
```bash
# Check migration history
railway run psql $DATABASE_URL -c "SELECT * FROM migrations;"

# Revert last migration if needed
railway run pnpm run migration:revert
```

---

## Performance Issues

### ❌ "Application slow to respond"

**Possible causes:**
1. Database queries not optimized
2. No database indexes
3. Missing Redis caching
4. Railway free tier limits

**Solution:**
```bash
# Enable query logging temporarily
railway variables set DB_LOGGING=true

# Check slow queries in logs
railway logs | grep "Query execution time"

# Add indexes to frequently queried columns
# Enable Redis caching for read-heavy endpoints
```

---

### ❌ "Out of memory"

**Cause:** Memory limit exceeded on free tier.

**Solution:**
1. **Upgrade to Hobby plan** ($5/month)
2. **Optimize memory usage:**
   - Reduce TypeORM connection pool size
   - Implement pagination everywhere
   - Clear unused imports

---

## SSL/HTTPS Issues

### ❌ "Mixed content warnings"

**Cause:** Frontend making HTTP requests to HTTPS API.

**Solution:**
Ensure frontend uses `https://` in API URL:
```env
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app/api/v1
```

---

### ❌ "SSL certificate invalid"

**Cause:** Custom domain SSL not provisioned yet.

**Solution:**
Wait 5-10 minutes after adding custom domain. Railway auto-provisions Let's Encrypt SSL.

Check status: Railway Dashboard → Settings → Networking

---

## Logging Issues

### ❌ "Logs not showing"

**Cause:** Logs may be buffered or filtered.

**Solution:**
```bash
# Use --follow to stream logs in real-time
railway logs --follow

# Increase verbosity
railway variables set LOG_LEVEL=debug

# Check specific error logs
railway logs --filter error
```

---

## Rollback Issues

### ❌ "Need to rollback to previous version"

**Solution:**
```bash
# Via CLI
railway status --deployments
railway rollback <deployment-id>

# Via Dashboard
1. Go to Deployments tab
2. Find last successful deployment
3. Click "Redeploy"
```

---

## GitHub Actions CI/CD Issues

### ❌ "GitHub Actions deployment fails"

**Cause:** Missing `RAILWAY_TOKEN` secret.

**Solution:**
1. Generate Railway token:
   ```bash
   railway tokens
   ```
2. Add to GitHub:
   - Go to repo Settings → Secrets and variables → Actions
   - Add secret: `RAILWAY_TOKEN`

---

### ❌ "Health check fails in GitHub Actions"

**Cause:** Deployment not ready when health check runs.

**Solution:** Add longer wait in `.github/workflows/railway-deploy.yml`:
```yaml
- name: Health Check
  run: |
    sleep 60  # Wait 60 seconds instead of 30
    # ... rest of health check
```

---

## Common Commands for Debugging

```bash
# View all environment variables
railway variables

# View logs in real-time
railway logs --follow

# Filter error logs
railway logs --filter error

# Check deployment status
railway status

# Check service health
railway status --service <service-name>

# Connect to PostgreSQL
railway run psql $DATABASE_URL

# Run commands in production environment
railway run <command>

# SSH into container (if available on your plan)
railway shell
```

---

## Still Having Issues?

1. **Check Railway Status:** [status.railway.app](https://status.railway.app)
2. **Search Railway Docs:** [docs.railway.app](https://docs.railway.app)
3. **Railway Discord:** [discord.gg/railway](https://discord.gg/railway)
4. **GitHub Issues:** Check this repo's issues or create one

---

## Useful Railway Commands Reference

```bash
# Project management
railway init            # Create new project
railway link            # Link existing project
railway unlink          # Unlink project

# Deployment
railway up              # Deploy current directory
railway up --detach     # Deploy without waiting

# Environment
railway variables       # List all variables
railway variables set KEY=value
railway variables get KEY
railway variables delete KEY

# Services
railway add             # Add service/database
railway remove          # Remove service

# Monitoring
railway logs            # View logs
railway logs --follow   # Stream logs
railway status          # Check status
railway open            # Open deployed URL

# Database
railway run psql $DATABASE_URL  # Connect to PostgreSQL
railway run redis-cli           # Connect to Redis

# Other
railway whoami          # Check login status
railway logout          # Logout
```

---

**🔍 Tip:** Most issues can be debugged with `railway logs --follow --filter error`
