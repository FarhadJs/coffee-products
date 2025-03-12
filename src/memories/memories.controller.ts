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
  Query,
} from '@nestjs/common';
import { MemoriesService } from './memories.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FindMemoriesDto } from './dto/find-memories.dto';
import { PaginatedResponse } from 'src/products/interfaces/product-response.interface';
import { MemoriesResponse } from './interfaces/memories-response.interface';

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
  async findAll(
    @Query() query: FindMemoriesDto,
  ): Promise<PaginatedResponse<MemoriesResponse>> {
    const { items, meta } = await this.memoriesService.findAll(query);
    return { items, meta };
  }

  @Get('admin')
  async findMemories(
    @Query() query: FindMemoriesDto,
  ): Promise<PaginatedResponse<MemoriesResponse>> {
    const { items, meta } = await this.memoriesService.findMemories(query);
    return { items, meta };
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
