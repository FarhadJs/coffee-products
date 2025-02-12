import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  // Handle static files for both development and production
  const uploadPath =
    process.env.NODE_ENV === 'production'
      ? join(process.cwd(), 'uploads')
      : join(__dirname, '..', 'uploads');

  app.useStaticAssets(uploadPath, {
    prefix: '/uploads/',
  });

  await app.listen(3000);
}
bootstrap();
