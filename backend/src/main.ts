import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as express from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Increase payload size limit for image uploads (base64)
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    // Security: Helmet for HTTP headers
    app.use(helmet());

    // Security: CORS configuration
    const allowedOrigins = process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL || 'https://fashionrenewal.com']
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3001', 'http://localhost:8080', 'http://localhost:8081'];

    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'x-session-id'],
    });

    // Global validation pipe with security options
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Strip properties that don't have decorators
            forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
            transform: true, // Auto-transform payloads to DTO instances
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
