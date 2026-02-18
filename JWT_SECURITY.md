# JWT Security Implementation

## Overview

This application implements enterprise-grade JWT authentication with Redis-based token blacklist for immediate token revocation on logout and user ban operations.

## Features

### ✅ Implemented Security Measures

1. **Token Expiration**
   - JWTs expire after configurable time (default: 24 hours)
   - Configured via `JWT_EXPIRATION` environment variable

2. **Token Blacklist (Redis)**
   - Individual token revocation on logout
   - User-level token ban on account deactivation
   - Automatic cleanup via Redis TTL
   - O(1) lookup performance

3. **Logout Functionality**
   - Backend endpoint: `POST /auth/logout`
   - Blacklists current token immediately
   - Frontend clears local storage
   - Prevents token reuse

4. **Admin Ban/Unban**
   - Admin can deactivate user accounts
   - All user tokens blacklisted immediately
   - Reactivation removes ban
   - Prevents banned users from using old tokens

## Architecture

### Token Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. Login (email/password)
       ▼
┌─────────────────┐
│  Auth Service   │──────► Generate JWT
└────────┬────────┘        (expires in 24h)
         │
         │ 2. Return token
         ▼
┌─────────────┐
│   Client    │──────► Store in localStorage
└──────┬──────┘
       │
       │ 3. API Request with token
       ▼
┌─────────────────┐
│  JwtAuthGuard   │
└────────┬────────┘
         │
         ├──► Verify JWT signature
         ├──► Check token blacklist (Redis)
         ├──► Check user ban status (Redis)
         │
         ▼
   Allow/Deny request
```

### Logout Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ POST /auth/logout (with token)
       ▼
┌─────────────────┐
│ Auth Controller │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│ TokenBlacklistService│──────► Add to Redis
└──────────────────────┘        TTL = token expiration
         │
         ▼
┌─────────────┐
│   Client    │──────► Clear localStorage
└─────────────┘        Redirect to login
```

### Ban Flow

```
┌─────────────┐
│    Admin    │
└──────┬──────┘
       │
       │ Deactivate User
       ▼
┌─────────────────┐
│  Admin Service  │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│ TokenBlacklistService│──────► Ban all user tokens
└──────────────────────┘        (7-day ban entry)
         │
         ▼
    User cannot access
    (all tokens invalid)
```

## Implementation Details

### 1. TokenBlacklistService

**Location:** `src/auth/services/token-blacklist.service.ts`

**Methods:**

```typescript
// Blacklist individual token
async blacklistToken(token: string, userId: number, reason: string): Promise<void>

// Check if token is blacklisted
async isTokenBlacklisted(token: string): Promise<boolean>

// Ban all user tokens (user-level ban)
async blacklistAllUserTokens(userId: number): Promise<void>

// Check if user is banned
async isUserBanned(userId: number): Promise<boolean>

// Remove user from ban list
async unbanUser(userId: number): Promise<void>

// Get blacklist information
async getBlacklistInfo(token: string): Promise<any>
```

**Redis Keys:**

- Token blacklist: `token_blacklist:{token_hash}`
- User ban: `user_ban:{userId}`

**TTL Strategy:**

- Individual tokens: TTL = token expiration time
- User bans: TTL = 7 days (604800 seconds)

### 2. JwtAuthGuard

**Location:** `src/auth/guards/jwt-auth.guard.ts`

**Validation Steps:**

1. Verify JWT signature (Passport strategy)
2. Check if token is individually blacklisted
3. Check if user is banned
4. Allow/deny request

**Code:**

```typescript
async canActivate(context: ExecutionContext): Promise<boolean> {
  // 1. Verify JWT signature
  const baseAuth = await super.canActivate(context);
  if (!baseAuth) return false;

  // 2. Extract token
  const request = context.switchToHttp().getRequest();
  const token = this.extractTokenFromHeader(request);
  if (!token) return false;

  // 3. Check blacklist
  const isBlacklisted = await this.tokenBlacklistService.isTokenBlacklisted(token);
  if (isBlacklisted) {
    throw new UnauthorizedException('Token has been revoked');
  }

  // 4. Check user ban
  const userId = request.user?.id;
  if (userId) {
    const isBanned = await this.tokenBlacklistService.isUserBanned(userId);
    if (isBanned) {
      throw new UnauthorizedException('User account is deactivated');
    }
  }

  return true;
}
```

### 3. Auth Module Configuration

**Location:** `src/auth/auth.module.ts`

**Redis Setup:**

```typescript
CacheModule.registerAsync({
  useFactory: async () => ({
    store: await redisStore({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD || undefined,
    }),
    ttl: 24 * 60 * 60, // 24 hours in seconds
  }),
});
```

### 4. Logout Endpoint

**Location:** `src/auth/auth.controller.ts`

**Endpoint:** `POST /auth/logout`

**Protection:** Requires JWT authentication

**Code:**

```typescript
@Post('logout')
@UseGuards(JwtAuthGuard)
async logout(@Req() req) {
  const token = req.headers.authorization?.split(' ')[1];
  const userId = req.user.id;

  if (token) {
    await this.authService.logout(token, userId);
  }

  return { message: 'Logged out successfully' };
}
```

### 5. Admin Ban/Unban

**Location:** `src/admin/admin.service.ts`

**Method:** `activateUser(userId, dto)`

**Behavior:**

- **Deactivation:** Blacklists all user tokens, prevents login
- **Reactivation:** Removes user from ban list, allows login

**Code:**

```typescript
async activateUser(userId: number, dto: ActivateUserDto): Promise<User> {
  const user = await this.usersRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  user.isActive = dto.isActive;

  // If deactivating user, blacklist all their tokens
  if (!dto.isActive) {
    await this.tokenBlacklistService.blacklistAllUserTokens(userId);
  } else {
    // If reactivating, remove from ban list
    await this.tokenBlacklistService.unbanUser(userId);
  }

  return this.usersRepository.save(user);
}
```

## Environment Variables

Required environment variables in `.env`:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=24h

# Redis Configuration (for token blacklist)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## Frontend Integration

### Logout Flow

**Location:** `client/src/services/auth.service.ts`

**Code:**

```typescript
async logout(): Promise<void> {
  try {
    // Call backend to blacklist token
    await apiClient.post(API_ENDPOINTS.LOGOUT);
  } catch (error) {
    // Even if backend call fails, clear local storage
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage and redirect
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}
```

### API Client Setup

**Location:** `client/src/services/api.service.ts`

Automatically includes JWT token in Authorization header:

```typescript
Authorization: `Bearer ${token}`;
```

## Security Best Practices

### ✅ Implemented

1. **Token Expiration:** All tokens expire after 24 hours
2. **Token Revocation:** Immediate invalidation on logout/ban
3. **Redis TTL:** Automatic cleanup of expired entries
4. **User-Level Ban:** Single operation blocks all user tokens
5. **Error Handling:** Graceful degradation on Redis errors
6. **Separation of Concerns:** Dedicated TokenBlacklistService

### 🔒 Additional Recommendations

1. **Rate Limiting:** Implement on login endpoint (consider `@nestjs/throttler`)
2. **Refresh Tokens:** Add long-lived refresh token for better UX
3. **Token Rotation:** Consider rotating tokens on each request
4. **IP Binding:** Optionally bind tokens to IP addresses
5. **Device Management:** Track and manage user sessions
6. **Audit Logs:** Log all authentication events

## Testing

### Test Logout

```bash
# 1. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# 2. Use token for protected endpoint
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Logout
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Try using token again (should fail)
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
# Expected: 401 Unauthorized - Token has been revoked
```

### Test Admin Ban

```bash
# 1. Admin deactivates user
curl -X PUT http://localhost:3001/api/admin/users/{userId}/activate \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'

# 2. User tries to access protected endpoint
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer USER_TOKEN"
# Expected: 401 Unauthorized - User account is deactivated
```

### Verify Redis

```bash
# Check Redis keys
redis-cli KEYS "token_blacklist:*"
redis-cli KEYS "user_ban:*"

# Check TTL on a key
redis-cli TTL "token_blacklist:HASH"

# Get blacklist info
redis-cli GET "token_blacklist:HASH"
```

## Performance Considerations

### Redis Performance

- **Lookup:** O(1) time complexity
- **TTL:** Automatic cleanup, no manual deletion needed
- **Memory:** SHA-256 hash (64 chars) + metadata (~200 bytes per token)
- **Scaling:** Redis can handle millions of requests/second

### Optimization Tips

1. **Connection Pooling:** Use Redis connection pool (already configured)
2. **Caching:** Redis serves as both cache and blacklist store
3. **TTL Strategy:** Matches JWT expiration for automatic cleanup
4. **Monitoring:** Use Redis INFO command to monitor memory usage

## Troubleshooting

### Issue: Tokens not being blacklisted

**Check:**

1. Redis is running: `redis-cli ping`
2. Environment variables are set correctly
3. TokenBlacklistService is injected properly

```bash
# Verify Redis connection
redis-cli -h localhost -p 6379 ping
```

### Issue: Logout doesn't invalidate token

**Check:**

1. Frontend is calling `/auth/logout` endpoint
2. Token is being sent in Authorization header
3. Redis keys are being created: `redis-cli KEYS "*"`

### Issue: Performance degradation

**Monitor:**

```bash
# Check Redis stats
redis-cli INFO stats

# Check memory usage
redis-cli INFO memory

# Check connected clients
redis-cli CLIENT LIST
```

## Migration Guide

### From Simple JWT to Blacklist

If migrating from simple JWT without blacklist:

1. **Install Dependencies:**

   ```bash
   npm install redis @nestjs/cache-manager cache-manager cache-manager-redis-yet
   ```

2. **Update Environment:**
   Add Redis configuration to `.env`

3. **Update AuthModule:**
   Import CacheModule with Redis store

4. **Create TokenBlacklistService:**
   Copy from `src/auth/services/token-blacklist.service.ts`

5. **Update JwtAuthGuard:**
   Add blacklist checking logic

6. **Update Frontend:**
   Make logout call async and call backend endpoint

## Resources

- [NestJS JWT Documentation](https://docs.nestjs.com/security/authentication)
- [Redis Documentation](https://redis.io/documentation)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
