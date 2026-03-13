#!/bin/bash

# Railway Setup Script
# This script helps you set up environment variables for Railway deployment

set -e

echo "================================================"
echo "  Railway Environment Setup for NestJS Backend"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found!${NC}"
    echo ""
    echo "Install it with:"
    echo "  npm install -g @railway/cli"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI found${NC}"
echo ""

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Railway${NC}"
    echo "Logging in..."
    railway login
    echo ""
fi

echo -e "${GREEN}✅ Logged in to Railway${NC}"
echo ""

# Check if project is linked
if ! railway status &> /dev/null; then
    echo -e "${YELLOW}⚠️  No Railway project linked${NC}"
    echo ""
    echo "Would you like to:"
    echo "  1. Link to existing project"
    echo "  2. Create new project"
    read -p "Enter choice (1 or 2): " choice
    echo ""
    
    if [ "$choice" = "1" ]; then
        railway link
    elif [ "$choice" = "2" ]; then
        railway init
    else
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
    fi
    echo ""
fi

echo -e "${GREEN}✅ Railway project linked${NC}"
echo ""

# Generate secure secrets
echo "================================================"
echo "  Generating Secure Secrets"
echo "================================================"
echo ""

JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

echo -e "${GREEN}Generated JWT secrets${NC}"
echo ""

# Prompt for CORS origins
echo "================================================"
echo "  Configure CORS Origins"
echo "================================================"
echo ""
echo "Enter your frontend domains (comma-separated):"
echo "Example: https://yourdomain.com,https://admin.yourdomain.com"
read -p "CORS_ORIGINS: " CORS_ORIGINS
echo ""

# Set environment variables
echo "================================================"
echo "  Setting Environment Variables"
echo "================================================"
echo ""

railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set API_PREFIX=api/v1

# Database settings
railway variables set DB_SYNC=false
railway variables set DB_LOGGING=false

# JWT secrets
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set JWT_EXPIRATION=15m
railway variables set JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
railway variables set JWT_REFRESH_EXPIRATION=7d

# CORS
if [ -n "$CORS_ORIGINS" ]; then
    railway variables set CORS_ORIGINS="$CORS_ORIGINS"
fi

# Rate limiting
railway variables set THROTTLE_TTL=60
railway variables set THROTTLE_LIMIT=100

# File upload
railway variables set STORAGE_PROVIDER=local
railway variables set MAX_FILE_SIZE=5242880
railway variables set UPLOAD_DIR=./uploads

# Pagination
railway variables set DEFAULT_PAGE_SIZE=20
railway variables set MAX_PAGE_SIZE=100

# Logging
railway variables set LOG_LEVEL=info

echo ""
echo -e "${GREEN}✅ Environment variables configured${NC}"
echo ""

# Add PostgreSQL if not exists
echo "================================================"
echo "  Database Configuration"
echo "================================================"
echo ""

read -p "Add PostgreSQL database? (y/n): " add_postgres
if [ "$add_postgres" = "y" ]; then
    railway add --database postgresql
    echo -e "${GREEN}✅ PostgreSQL added${NC}"
    echo ""
fi

# Add Redis if needed
read -p "Add Redis for caching? (y/n): " add_redis
if [ "$add_redis" = "y" ]; then
    railway add --database redis
    railway variables set REDIS_TTL=3600
    echo -e "${GREEN}✅ Redis added${NC}"
    echo ""
fi

# Display summary
echo "================================================"
echo "  Setup Complete!"
echo "================================================"
echo ""
echo "Your Railway environment is now configured with:"
echo "  ✅ Production environment variables"
echo "  ✅ Secure JWT secrets"
echo "  ✅ CORS origins configured"
echo "  ✅ Rate limiting enabled"
echo ""

if [ "$add_postgres" = "y" ]; then
    echo "  ✅ PostgreSQL database"
fi

if [ "$add_redis" = "y" ]; then
    echo "  ✅ Redis cache"
fi

echo ""
echo "Next steps:"
echo "  1. Review variables: railway variables"
echo "  2. Deploy: railway up"
echo "  3. Run migrations: railway run pnpm run migration:run"
echo "  4. Check logs: railway logs"
echo "  5. View deployment: railway open"
echo ""
echo "================================================"
echo "  Saved Secrets (Keep these secure!)"
echo "================================================"
echo ""
echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
echo ""
echo "⚠️  Save these secrets securely (e.g., password manager)"
echo ""
