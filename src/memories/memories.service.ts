import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Memory, MemoryDocument } from './entities/memory.entity';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { FindMemoriesDto } from './dto/find-memories.dto';
import { PaginatedResponse } from 'src/products/interfaces/product-response.interface';

@Injectable()
export class MemoriesService {
  constructor(
    @InjectModel(Memory.name) private memoryModel: Model<MemoryDocument>,
  ) {}
  async create(createMemoryDto: CreateMemoryDto) {
    const memory = {
      ...createMemoryDto,
      isApproved: false,
    };
    const createdMemory = await this.memoryModel.create(memory);
    return { message: 'یادگاری با موفقیت ثبت شد', data: createdMemory };
  }

  async findAll(
    query: FindMemoriesDto,
  ): Promise<PaginatedResponse<MemoryDocument>> {
    const { page = 1, limit = 10 } = query;
    const total = await this.memoryModel.countDocuments({ isApproved: true });

    return {
      items: await this.memoryModel
        .find({ isApproved: true })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findMemories(
    query: FindMemoriesDto,
  ): Promise<PaginatedResponse<MemoryDocument>> {
    const { page = 1, limit = 10 } = query;
    const total = await this.memoryModel.countDocuments();

    return {
      items: await this.memoryModel
        .find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async approve(id: string): Promise<Memory> {
    const memory = await this.memoryModel.findById(id);
    if (!memory) {
      throw new ConflictException('یادگاری پیدا نشد!');
    }
    memory.isApproved = !memory.isApproved;
    return await memory.save();
  }

  async remove(id: string) {
    const memory = await this.memoryModel.findById(id).exec();
    if (!memory) {
      throw new BadRequestException('یادگاری پیدا نشد!');
    }
    return {
      message: 'یادگاری با موفقیت حذف شد',
      data: await this.memoryModel.findByIdAndDelete(id).exec(),
    };
  }
}
