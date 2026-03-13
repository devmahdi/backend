# 🚀 Railway Quick Start Guide

Get your NestJS backend deployed to Railway in under 10 minutes.

## Prerequisites

- Railway account → [Sign up free](https://railway.app)
- Repository pushed to GitHub
- 5 minutes of your time ⏱️

---

## Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

---

## Step 2: Login to Railway

```bash
railway login
```

This opens your browser for authentication.

---

## Step 3: Run the Setup Script

We've created an automated setup script to configure everything:

```bash
cd backend
chmod +x scripts/setup-railway.sh
./scripts/setup-railway.sh
```

This script will:
- ✅ Link your Railway project
- ✅ Generate secure JWT secrets
- ✅ Configure all environment variables
- ✅ Add PostgreSQL database
- ✅ (Optional) Add Redis for caching

Follow the prompts and enter your frontend domain(s) when asked.

---

## Step 4: Deploy

```bash
railway up
```

That's it! Railway will:
1. Build your Docker image
2. Deploy to production
3. Run health checks
4. Give you a public URL

---

## Step 5: Run Database Migrations

```bash
railway run pnpm run migration:run
```

---

## Step 6: Verify Deployment

```bash
# Check deployment status
railway status

# View logs
railway logs

# Open your deployed API
railway open
```

Your API is now live at:
- `https://your-app.up.railway.app/api/v1`
- Swagger docs: `https://your-app.up.railway.app/api/docs`
- Health check: `https://your-app.up.railway.app/api/v1/health`

---

## Step 7: Configure Custom Domain (Optional)

1. Go to Railway Dashboard
2. Click **Settings → Networking**
3. Add your domain (e.g., `api.yourdomain.com`)
4. Add the CNAME record to your DNS

Railway handles SSL automatically. 🔒

---

## Step 8: Set Up Auto-Deploy from GitHub

Railway automatically deploys on every push to `main` branch.

To customize:
1. Go to **Settings → Triggers**
2. Choose branch and deployment conditions

---

## Troubleshooting

### Build fails with "pnpm not found"

Railway should auto-detect pnpm from `package.json` engines. If it doesn't:

1. Go to **Settings → Build**
2. Set Build Command: `npm install -g pnpm && pnpm install && pnpm run build`

### Health check fails

Check logs: `railway logs`

Common issues:
- Database not connected (wait 30s after first deploy)
- Environment variables missing (run `railway variables`)
- Port not binding to `process.env.PORT`

### Database connection errors

Ensure you've added PostgreSQL service:

```bash
railway add --database postgresql
```

Railway auto-injects database credentials.

---

## Next Steps

- [x] Backend deployed ✅
- [ ] Run database seed: `railway run pnpm run seed`
- [ ] Connect frontend (update `NEXT_PUBLIC_API_URL`)
- [ ] Set up monitoring alerts
- [ ] Configure custom domain
- [ ] Enable Redis caching
- [ ] Set up CI/CD with GitHub Actions

---

## Manual Setup (Without Script)

If you prefer manual setup, see [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed step-by-step instructions.

---

## Get Help

- **Logs:** `railway logs --follow`
- **Variables:** `railway variables`
- **Status:** `railway status`
- **Documentation:** [docs.railway.app](https://docs.railway.app)

---

**🎉 Your NestJS backend is now live on Railway!**

Total setup time: ~10 minutes ⚡
