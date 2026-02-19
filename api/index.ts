import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { AppModule } from '../src/app.module';

const server = express();
let cachedApp: express.Express | null = null;
let bootstrapPromise: Promise<express.Express> | null = null;

async function bootstrap(): Promise<express.Express> {
  if (cachedApp) return cachedApp;

  // Prevent multiple concurrent bootstrap calls during cold start
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    try {
      const adapter = new ExpressAdapter(server);
      const app = await NestFactory.create(AppModule, adapter, {
        logger: ['error', 'warn'],
      });

      app.enableCors({
        origin: true,
        credentials: true,
      });

      app.setGlobalPrefix('api');

      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );

      await app.init();
      cachedApp = server;
      return cachedApp;
    } catch (error) {
      bootstrapPromise = null; // Allow retry on next request
      throw error;
    }
  })();

  return bootstrapPromise;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await bootstrap();
    app(req, res);
  } catch (error) {
    console.error('Bootstrap error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message:
        process.env.NODE_ENV !== 'production'
          ? String(error)
          : 'Server initialization failed',
    });
  }
}
