import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL', 'http://localhost:5173'),
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('RepoLens API')
    .setDescription('RepoLens backend API')
    .setVersion('0.1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
