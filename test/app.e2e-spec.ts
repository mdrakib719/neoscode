import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Banking System E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: number;
  let accountId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('/api/auth/register (POST)', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201)
        .then((response) => {
          expect(response.body.user).toBeDefined();
          expect(response.body.user.email).toBe('test@example.com');
          userId = response.body.user.id;
        });
    });

    it('/api/auth/login (POST)', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201)
        .then((response) => {
          expect(response.body.access_token).toBeDefined();
          authToken = response.body.access_token;
        });
    });
  });

  describe('Accounts', () => {
    it('/api/accounts (POST) - Create account', () => {
      return request(app.getHttpServer())
        .post('/api/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          account_type: 'SAVINGS',
        })
        .expect(201)
        .then((response) => {
          expect(response.body.account_number).toBeDefined();
          accountId = response.body.id;
        });
    });

    it('/api/accounts (GET) - Get user accounts', () => {
      return request(app.getHttpServer())
        .get('/api/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
        });
    });
  });

  describe('Transactions', () => {
    it('/api/transactions/deposit (POST)', () => {
      return request(app.getHttpServer())
        .post('/api/transactions/deposit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accountId: accountId,
          amount: 1000,
          description: 'Test deposit',
        })
        .expect(201);
    });

    it('/api/transactions (GET) - Get transaction history', () => {
      return request(app.getHttpServer())
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
