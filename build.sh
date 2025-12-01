#!/bin/bash

# Chat App - Pre-Deployment Build Script
# This script builds both frontend and backend for production

set -e

echo "========================================"
echo "Chat App - Pre-Deployment Build"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Error: Node.js is not installed${NC}"
    exit 1
fi

echo -e "${BLUE}Node version:${NC}"
node --version
echo ""

# Step 1: Frontend Build
echo -e "${BLUE}Step 1: Building Frontend...${NC}"
cd Frontend
echo "Installing dependencies..."
npm ci
echo "Building production bundle..."
npm run build

if [ -d "dist" ]; then
    echo -e "${GREEN}✓ Frontend build successful${NC}"
    FRONTEND_SIZE=$(du -sh dist | cut -f1)
    echo -e "  Bundle size: $FRONTEND_SIZE"
else
    echo -e "${YELLOW}Error: Frontend build failed${NC}"
    exit 1
fi

cd ..
echo ""

# Step 2: Backend Check
echo -e "${BLUE}Step 2: Checking Backend...${NC}"
cd Backend
echo "Installing dependencies..."
npm ci

# Check for required environment variables
REQUIRED_VARS=("MONGODB_URI" "GROQ_API_KEY" "JWT_SECRET")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ] && ! grep -q "$var=" .env 2>/dev/null; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}Warning: Missing environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Create a .env file with these variables before deployment."
else
    echo -e "${GREEN}✓ Environment variables configured${NC}"
fi

# Check server.js exists
if [ -f "server.js" ]; then
    echo -e "${GREEN}✓ Server entry point found${NC}"
else
    echo -e "${YELLOW}Error: server.js not found${NC}"
    exit 1
fi

cd ..
echo ""

# Step 3: Summary
echo -e "${BLUE}========================================"
echo "Build Summary"
echo "========================================${NC}"
echo ""
echo -e "${GREEN}✓ Frontend:${NC} Production build ready (dist/)"
echo -e "${GREEN}✓ Backend:${NC} Dependencies installed (node_modules/)"
echo ""
echo -e "${YELLOW}Next steps for deployment:${NC}"
echo "1. Set environment variables on your hosting platform:"
echo "   - MONGODB_URI"
echo "   - GROQ_API_KEY"
echo "   - JWT_SECRET"
echo "   - FRONTEND_URL"
echo ""
echo "2. Choose a deployment platform:"
echo "   - Render.com (Recommended)"
echo "   - Vercel + Railway"
echo "   - Heroku"
echo ""
echo "3. See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
echo -e "${GREEN}Ready to deploy!${NC}"
