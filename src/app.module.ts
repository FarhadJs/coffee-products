import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { AnnouncementsModule } from './announcements/announcements.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URL ||
        'mongodb://root:49yPcaKu0kxdSIEe9LVb3hMg@ace-coffee:27017/my-app?authSource=admin',
    ),
    ProductsModule,
    AuthModule,
    CategoriesModule,
    UsersModule,
    AnnouncementsModule,
  ],
})
export class AppModule {}
