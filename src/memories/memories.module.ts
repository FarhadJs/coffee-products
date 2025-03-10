import { Module } from '@nestjs/common';
import { MemoriesService } from './memories.service';
import { MemoriesController } from './memories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Memory, MemorySchema } from './entities/memory.entity';
import { MulterModule } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/multer.config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Memory.name, schema: MemorySchema }]),
    MulterModule.register(multerOptions),
  ],
  controllers: [MemoriesController],
  providers: [MemoriesService],
})
export class MemoriesModule {}
