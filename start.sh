#!/bin/bash

echo "======================================"
echo "Banking System - Full Stack Startup"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MySQL is running
echo -e "${BLUE}Checking MySQL server...${NC}"
if ! mysql -u root -e "SELECT 1;" &>/dev/null; then
    echo -e "${RED}MySQL is not running. Please start MySQL first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ MySQL is running${NC}"

# Check if database exists
echo -e "${BLUE}Checking database...${NC}"
if ! mysql -u root -e "USE banking_system;" &>/dev/null; then
    echo -e "${BLUE}Creating database...${NC}"
    mysql -u root < database/schema.sql
    mysql -u root banking_system < database/seed.sql
    echo -e "${GREEN}✓ Database created and seeded${NC}"
else
    echo -e "${GREEN}✓ Database exists${NC}"
fi

# Install backend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing backend dependencies...${NC}"
    npm install
fi

# Install frontend dependencies
if [ ! -d "client/node_modules" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    cd client && npm install && cd ..
fi

echo ""
echo -e "${GREEN}======================================"
echo "Starting Banking System"
echo "======================================${NC}"
echo ""
echo -e "${BLUE}Backend API:${NC} http://localhost:3001/api"
echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
echo ""
echo -e "${GREEN}Demo Accounts:${NC}"
echo "Customer: customer@banking.com / password123"
echo "Admin: admin@banking.com / password123"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
echo -e "${BLUE}Starting backend...${NC}"
npm run start:dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo -e "${BLUE}Starting frontend...${NC}"
cd client && npm run dev &
FRONTEND_PID=$!

# Wait for user to stop
wait

# Cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Keep script running
wait
