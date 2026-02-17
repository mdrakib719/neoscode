# Interview Questions & Answers - Banking System

## Architecture & Design

### Q1: Explain the overall architecture of this banking system

**Answer:** This is a professional banking system built with NestJS following a modular monolithic architecture. The key components are:

- **Modules:** Auth, Users, Accounts, Transactions, Loans, Interest, Reports
- **Database:** MySQL with TypeORM as the ORM
- **Authentication:** JWT-based authentication with Passport
- **Authorization:** Role-Based Access Control (RBAC) with three roles: ADMIN, EMPLOYEE, CUSTOMER
- **Scheduling:** Cron jobs for automated interest calculation
- **Security:** bcrypt for password hashing, rate limiting, input validation

The architecture follows the **Controller → Service → Repository** pattern, ensuring separation of concerns and testability.

---

## Database & Transactions

### Q2: How do you handle database transactions, especially for money transfers?

**Answer:** I use TypeORM's **QueryRunner** for database transactions to ensure ACID properties:

```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();

try {
  // Deduct from sender
  // Add to receiver
  // Create transaction record

  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  await queryRunner.release();
}
```

This ensures that either all operations succeed or all fail, preventing partial transfers.

### Q3: What happens if a transfer fails midway?

**Answer:** The transaction is automatically rolled back using `queryRunner.rollbackTransaction()`. This means:

- The sender's balance is not deducted
- The receiver's balance is not credited
- No transaction record is created
- The database remains consistent

---

## Authentication & Security

### Q4: How is authentication implemented?

**Answer:**

1. **Registration:** Password is hashed using bcrypt (10 salt rounds)
2. **Login:** Password is verified against hash, JWT token generated
3. **JWT Payload:** Contains userId, email, and role
4. **Token Expiration:** 24 hours (configurable)
5. **Guards:** JwtAuthGuard protects routes, RolesGuard enforces permissions

### Q5: Explain Role-Based Access Control (RBAC)

**Answer:** Three roles with different permissions:

**CUSTOMER:**

- Create/view own accounts
- Perform transactions
- Apply for loans
- View own reports

**EMPLOYEE:**

- All customer permissions
- View all users
- Approve/reject loans

**ADMIN:**

- All employee permissions
- Manage users
- Apply interest manually
- View system reports

Implementation uses custom `@Roles()` decorator and `RolesGuard`.

---

## Loan Management

### Q6: How is EMI calculated?

**Answer:** Using the standard EMI formula:

```
EMI = [P x R x (1+R)^N] / [(1+R)^N – 1]

Where:
P = Principal loan amount
R = Monthly interest rate (annual rate / 12 / 100)
N = Tenure in months
```

Example:

- Loan: ₹50,000
- Rate: 8.5% annual
- Tenure: 36 months
- EMI: ₹1,575.45

### Q7: Explain the loan approval workflow

**Answer:**

1. Customer applies for loan via `/loans/apply`
2. System calculates EMI automatically
3. Status set to **PENDING**
4. Admin/Employee reviews application
5. Approves via `/loans/:id/approve` or Rejects via `/loans/:id/reject`
6. Status updated to **APPROVED** or **REJECTED**
7. Customer can view repayment schedule via `/loans/:id/repayment-schedule`

---

## Interest Calculation

### Q8: How does the automated interest calculation work?

**Answer:** Using NestJS Schedule module with cron jobs:

```typescript
@Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
async handleMonthlyInterest() {
  // Get all savings accounts
  // Calculate interest (4% annual = 0.33% monthly)
  // Update balance
  // Create transaction record
}
```

- Runs automatically on the 1st of every month
- Interest rate: 4% annual (0.33% monthly)
- Only applies to savings accounts
- Creates audit trail in transactions table

### Q9: Can interest be applied manually?

**Answer:** Yes, admins can trigger via `POST /interest/apply`. This is useful for:

- Testing
- Adjustments
- Backdated interest application

---

## Performance & Optimization

### Q10: How would you optimize this system for high traffic?

**Answer:**

1. **Database Indexing:** Add indexes on frequently queried columns (account_number, user_id, email)
2. **Caching:** Use Redis for session management and frequently accessed data
3. **Database Connection Pooling:** Configure TypeORM connection pool
4. **Pagination:** Implement pagination for large result sets
5. **Query Optimization:** Use query builder efficiently, avoid N+1 queries
6. **Load Balancing:** Deploy multiple instances behind a load balancer
7. **Rate Limiting:** Already implemented with Throttler module

### Q11: How do you prevent race conditions in concurrent transactions?

**Answer:**

- Database transactions with isolation levels
- Pessimistic locking when reading account balance
- Atomic operations in QueryRunner
- Version fields for optimistic locking (if needed)

---

## Validation & Error Handling

### Q12: How is input validation handled?

**Answer:** Using `class-validator` and `class-transformer`:

```typescript
export class DepositDto {
  @IsNumber()
  @IsPositive()
  accountId: number;

  @IsNumber()
  @IsPositive()
  amount: number;
}
```

Global validation pipe in `main.ts` ensures all DTOs are validated.

### Q13: How are errors handled?

**Answer:**

- Global exception filter catches all errors
- Specific HTTP exceptions (NotFoundException, BadRequestException, etc.)
- Database transaction rollback on errors
- Consistent error response format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Testing

### Q14: What testing strategies are implemented?

**Answer:**

1. **Unit Tests:** Service layer tests with mocked dependencies
2. **E2E Tests:** Full API workflow tests
3. **Test Coverage:** Configured with Jest
4. **Mocking:** Repository and external service mocks

Example test structure:

```typescript
describe('TransactionsService', () => {
  // Setup mocks
  // Test deposit
  // Test rollback on failure
});
```

---

## Scalability

### Q15: How would you scale this system to millions of users?

**Answer:**

1. **Microservices:** Break into separate services (Auth, Transactions, Loans)
2. **Database Sharding:** Partition users across multiple databases
3. **Read Replicas:** Separate read and write databases
4. **Event-Driven Architecture:** Use message queues (RabbitMQ, Kafka)
5. **Caching:** Redis for session and frequently accessed data
6. **CDN:** For static assets
7. **Horizontal Scaling:** Auto-scaling with Kubernetes

---

## Advanced Features

### Q16: What additional features would you implement?

**Answer:**

1. **Email Notifications:** For transactions, loan approvals
2. **SMS Alerts:** Transaction alerts
3. **PDF Reports:** Generate PDF statements
4. **Audit Logs:** Track all user actions
5. **2FA:** Two-factor authentication
6. **Password Reset:** Email-based password recovery
7. **Transaction Limits:** Daily/monthly transaction limits
8. **Fraud Detection:** Monitor unusual activity
9. **Account Statements:** Downloadable monthly statements
10. **Loan Repayment:** Track EMI payments

---

## Code Quality

### Q17: How do you ensure code quality?

**Answer:**

- **ESLint:** Linting rules for TypeScript
- **Prettier:** Code formatting
- **TypeScript:** Type safety
- **Design Patterns:** Dependency Injection, Repository Pattern
- **SOLID Principles:** Single Responsibility, Open/Closed, etc.
- **Code Reviews:** Peer review process
- **Testing:** Unit and E2E tests

---

## Real-World Scenarios

### Q18: How would you handle a customer requesting a refund?

**Answer:**

1. Verify the transaction exists
2. Check refund eligibility (time window, policy)
3. Create reverse transaction
4. Update both accounts atomically using QueryRunner
5. Log the refund transaction
6. Send notification to customer

### Q19: What if the database crashes during a transaction?

**Answer:**

- Transaction is automatically rolled back
- No partial state is saved
- Client receives an error response
- User can retry the transaction
- Database integrity is maintained due to ACID properties

---

## Best Practices Demonstrated

✅ Modular architecture
✅ Separation of concerns
✅ Database transactions
✅ Authentication & Authorization
✅ Input validation
✅ Error handling
✅ Scheduled jobs
✅ Security best practices
✅ RESTful API design
✅ Documentation
