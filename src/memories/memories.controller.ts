import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MemoriesService } from './memories.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('memories')
export class MemoriesController {
  constructor(private readonly memoriesService: MemoriesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  async create(
    @Body() createMemoryDto: CreateMemoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const memoriesData = {
      ...createMemoryDto,
      imagePath: file ? `uploads/${file.filename}` : '',
    };

    return await this.memoriesService.create(memoriesData);
  }

  @Get()
  findAll() {
    return this.memoriesService.findAll();
  }

  @Get('admin')
  findMemories() {
    return this.memoriesService.findMemories();
  }

  @Roles(UserRole.FOUNDER, UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string) {
    return this.memoriesService.approve(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.memoriesService.remove(id);
  }
}
