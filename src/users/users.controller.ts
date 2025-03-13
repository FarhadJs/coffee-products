import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import fs from 'fs';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.FOUNDER, UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,
  ) {
    if (file) {
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only JPEG, PNG, and GIF are allowed.',
        );
      }

      const uniqueSuffix = uuidv4() + extname(file.originalname);
      const outputFilePath = join(
        __dirname,
        '..',
        '..',
        'uploads',
        `${uniqueSuffix}`,
      );

      // compress the file
      await sharp(file.buffer)
        .resize(800)
        .toFormat('jpeg', { quality: 80 })
        .toFile(outputFilePath);

      const userData: CreateUserDto = {
        ...createUserDto,
        image: file
          ? { data: file.buffer, contentType: file.mimetype }
          : undefined,
        imagePath: uniqueSuffix,
      };
      return this.usersService.create(userData);
    }

    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.FOUNDER, UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const existingUser = await this.usersService.findOne(id);
    if (!existingUser) {
      throw new BadRequestException(`User with ID ${id} not found`);
    }

    if (file) {
      if (existingUser.imagePath) {
        const previousImagePath = join(
          __dirname,
          '..',
          '..',
          existingUser.imagePath,
        );
        fs.unlink(previousImagePath, (err) => {
          if (err) {
            console.error(`Failed to delete file:`, err);
          }
        });
      }

      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only JPEG, PNG, and GIF are allowed.',
        );
      }

      const uniqueSuffix = uuidv4() + extname(file.originalname);
      const outputFilePath = join(
        __dirname,
        '..',
        '..',
        'uploads',
        `${uniqueSuffix}`,
      );

      // compress the file
      await sharp(file.buffer)
        .resize(800)
        .toFormat('jpeg', { quality: 80 })
        .toFile(outputFilePath);

      const updatedUser = {
        ...updateUserDto,
        image: file
          ? { data: file.buffer, contentType: file.mimetype }
          : undefined,
        imagePath: `uploads/${uniqueSuffix}`,
      };

      return this.usersService.update(id, updatedUser);
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.FOUNDER, UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
