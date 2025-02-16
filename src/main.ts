import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security
  app.use(helmet());
  app.use(compression());
  app.setGlobalPrefix('api');
  app.useStaticAssets(join(__dirname, '..', '/dist'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  // Only need CORS
  // app.enableCors();
  await app.listen(process.env.PORT || 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT || 3000}`,
  );
}
bootstrap().catch((err) =>
  console.log('to running the server hase problem!:' + err),
);
