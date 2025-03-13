import { Module } from '@nestjs/common';
import { MemoriesService } from './memories.service';
import { MemoriesController } from './memories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Memory, MemorySchema } from './entities/memory.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Memory.name, schema: MemorySchema }]),
  ],
  controllers: [MemoriesController],
  providers: [MemoriesService],
})
export class MemoriesModule {}
