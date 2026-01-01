#!/bin/bash

echo "=========================================="
echo "  Timesheet Application Setup (Supabase)"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version) detected${NC}"

echo ""
echo "Setting up backend..."
cd backend

# Install dependencies
echo "Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies${NC}"
    exit 1
fi

# Copy .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${YELLOW}⚠ IMPORTANT: Configure your .env file!${NC}"
    echo ""
    echo "You need to:"
    echo "1. Create a Supabase project at https://supabase.com"
    echo "2. Get your Supabase credentials:"
    echo "   - Project URL"
    echo "   - anon public key"
    echo "   - service_role key"
    echo "3. Update backend/.env with these values"
    echo ""
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

cd ..

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. ${YELLOW}Create Supabase Project:${NC}"
echo "   • Go to https://supabase.com"
echo "   • Create a new project"
echo "   • Save your database password!"
echo ""
echo "2. ${YELLOW}Setup Database:${NC}"
echo "   • Open Supabase SQL Editor"
echo "   • Copy contents of database/schema.sql"
echo "   • Run the SQL script"
echo ""
echo "3. ${YELLOW}Configure Backend:${NC}"
echo "   • Edit backend/.env"
echo "   • Add your Supabase credentials:"
echo "     - SUPABASE_URL"
echo "     - SUPABASE_ANON_KEY"
echo "     - SUPABASE_SERVICE_KEY"
echo "   • Generate JWT secret:"
echo "     ${GREEN}node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"${NC}"
echo ""
echo "4. ${YELLOW}Start Backend:${NC}"
echo "   ${GREEN}cd backend && npm start${NC}"
echo ""
echo "5. ${YELLOW}Serve Frontends (in separate terminals):${NC}"
echo ""
echo "   Admin Portal:"
echo "   ${GREEN}cd frontend-admin && python3 -m http.server 8080${NC}"
echo "   ${GREEN}Open: http://localhost:8080${NC}"
echo ""
echo "   Kiosk:"
echo "   ${GREEN}cd frontend-kiosk && python3 -m http.server 3000${NC}"
echo "   ${GREEN}Open: http://localhost:3000${NC}"
echo ""
echo "   User Setup:"
echo "   ${GREEN}cd frontend-user-setup && python3 -m http.server 8081${NC}"
echo "   ${GREEN}Open: http://localhost:8081${NC}"
echo ""
echo "6. ${YELLOW}Default admin credentials:${NC}"
echo "   Email: ${GREEN}admin@timesheet.com${NC}"
echo "   Password: ${GREEN}Admin@123${NC}"
echo "   ${RED}⚠ Change this after first login!${NC}"
echo ""
echo "=========================================="
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "• README.md - Complete setup guide"
echo "• API_DOCUMENTATION.md - API reference"
echo "• DEPLOYMENT.md - Production deployment"
echo "• database/schema.sql - Database structure"
echo ""
echo "=========================================="
