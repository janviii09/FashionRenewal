import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS for frontend
    app.enableCors({
        origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3001'],
        credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe());
    await app.listen(3000);
}
bootstrap();
