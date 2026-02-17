# Banking System - Full Stack Application

A complete banking system built with **NestJS** (Backend) and **React + TypeScript** (Frontend) following **MVC architecture**.

## 🏗️ Architecture

### Backend (NestJS - MVC Pattern)

- **Models**: TypeORM entities (User, Account, Transaction, Loan)
- **Views**: API endpoints with JSON responses
- **Controllers**: NestJS controllers handling HTTP requests
- **Services**: Business logic layer

### Frontend (React - MVC Pattern)

- **Models**: TypeScript interfaces and types
- **Views**: React components (Login, Dashboard, etc.)
- **Controllers**: Zustand state management stores

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- MySQL (v8+)
- npm or yarn

### One-Command Startup

```bash
./start.sh
```

This script will:

1. Check MySQL server
2. Create/verify database
3. Install dependencies
4. Start both backend and frontend

### Manual Setup

#### 1. Database Setup

```bash
# Start MySQL
mysql.server start

# Create database and tables
mysql -u root < database/schema.sql

# Load sample data
mysql -u root banking_system < database/seed.sql
```

#### 2. Backend Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and set your database password
nano .env

# Start backend (runs on port 3001)
npm run start:dev
```

#### 3. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start frontend (runs on port 3000)
npm run dev
```

## 📱 Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Documentation**: See API_DOCUMENTATION.md

## 🔐 Demo Accounts

### Customer Account

- **Email**: customer@banking.com
- **Password**: password123
- **Access**: View accounts, transactions, apply for loans

### Employee Account

- **Email**: john.employee@banking.com
- **Password**: password123
- **Access**: View all accounts, process transactions

### Admin Account

- **Email**: admin@banking.com
- **Password**: password123
- **Access**: Full system access, approve/reject loans

## 🎯 Features

### Customer Features

- ✅ User registration and login
- ✅ View dashboard with account summary
- ✅ Create savings/checking accounts
- ✅ Deposit and withdraw funds
- ✅ Transfer money between accounts
- ✅ Apply for loans (Personal, Home, Vehicle, Education)
- ✅ View transaction history
- ✅ Check loan status and EMI details

### Employee/Admin Features

- ✅ View all customer accounts
- ✅ Process deposits and withdrawals
- ✅ Approve/reject loan applications
- ✅ Generate reports
- ✅ Apply monthly interest
- ✅ System overview and analytics

## 🗂️ Project Structure

```
banking-system/
├── src/                          # Backend (NestJS)
│   ├── auth/                     # Authentication module
│   ├── users/                    # User management
│   ├── accounts/                 # Account management
│   ├── transactions/             # Transaction processing
│   ├── loans/                    # Loan management
│   ├── interest/                 # Interest calculation
│   ├── reports/                  # Reporting module
│   ├── common/                   # Shared utilities
│   └── config/                   # Configuration
│
├── client/                       # Frontend (React)
│   ├── src/
│   │   ├── models/               # TypeScript types (M)
│   │   ├── views/                # React components (V)
│   │   │   ├── auth/            # Login, Register
│   │   │   ├── dashboard/       # Dashboard
│   │   │   ├── accounts/        # Account views
│   │   │   ├── transactions/    # Transaction views
│   │   │   └── loans/           # Loan views
│   │   ├── controllers/          # State management (C)
│   │   ├── services/             # API services
│   │   ├── config/               # API configuration
│   │   └── components/           # Shared components
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── database/                     # MySQL scripts
│   ├── schema.sql               # Database schema
│   ├── seed.sql                 # Sample data
│   ├── procedures.sql           # Stored procedures
│   └── queries.sql              # Useful queries
│
├── package.json                  # Backend dependencies
├── start.sh                      # Startup script
└── README-FULLSTACK.md          # This file
```

## 🔧 Environment Variables

### Backend (.env)

```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=banking_system
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
```

### Frontend (automatically proxied)

- API calls to `/api/*` are proxied to `http://localhost:3001`

## 🛠️ Development Commands

### Backend

```bash
npm run start:dev    # Development mode with hot reload
npm run build        # Build for production
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
```

### Frontend

```bash
cd client
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 📊 Database

### Tables

- `users` - User accounts and authentication
- `accounts` - Bank accounts
- `transactions` - Transaction records
- `loans` - Loan applications

### Sample Data

- 8 users (1 admin 2 employees, 5 customers)
- 10 accounts
- 13 transactions
- 7 loans

### Useful Queries

See `database/queries.sql` for 50+ ready-to-use SQL queries

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ Input validation
- ✅ SQL injection protection
- ✅ CORS configuration
- ✅ Rate limiting

## 🧪 Testing

### Backend Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Manual Testing

1. Start the application: `./start.sh`
2. Open http://localhost:3000
3. Login with demo credentials
4. Test features:
   - Create account
   - Deposit money
   - Transfer funds
   - Apply for loan
   - View reports

## 📈 Monitoring

### Backend Logs

The backend logs all requests and errors to the console

### Frontend Network

Use browser DevTools Network tab to monitor API calls

## 🐛 Troubleshooting

### MySQL Connection Error

```bash
# Check if MySQL is running
mysql.server status

# Start MySQL
mysql.server start

# Check database exists
mysql -u root -e "SHOW DATABASES LIKE 'banking_system';"
```

### Port Already in Use

```bash
# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Dependencies Issues

```bash
# Clean install backend
rm -rf node_modules package-lock.json
npm install

# Clean install frontend
cd client
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Deployment

### Backend (NestJS)

1. Build: `npm run build`
2. Set environment variables
3. Run: `node dist/main.js`

### Frontend (React)

1. Build: `cd client && npm run build`
2. Serve the `client/dist` folder with any static server

### Database

1. Export: `mysqldump -u root banking_system > backup.sql`
2. Import: `mysql -u root banking_system < backup.sql`

## 📝 API Documentation

See `API_DOCUMENTATION.md` for complete API reference with all 26 endpoints.

### Key Endpoints

#### Authentication

- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login

#### Accounts

- GET `/api/accounts` - Get all accounts
- POST `/api/accounts` - Create account

#### Transactions

- POST `/api/transactions/deposit` - Deposit money
- POST `/api/transactions/withdraw` - Withdraw money
- POST `/api/transactions/transfer` - Transfer money

#### Loans

- POST `/api/loans/apply` - Apply for loan
- POST `/api/loans/:id/approve` - Approve loan (Admin)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ using NestJS and React

## 🆘 Support

For issues and questions:

1. Check `TROUBLESHOOTING.md`
2. Review `API_DOCUMENTATION.md`
3. Check console logs
4. Verify database connection

---

**Happy Banking! 🏦**
