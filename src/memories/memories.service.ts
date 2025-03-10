import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Memory, MemoryDocument } from './entities/memory.entity';
import { CreateMemoryDto } from './dto/create-memory.dto';

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

  async findAll(): Promise<Memory[]> {
    return await this.memoryModel.find({ isApproved: true }).exec();
  }

  async findMemories(): Promise<Memory[]> {
    return await this.memoryModel.find().exec();
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
