import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Announcement,
  AnnouncementDocument,
} from './entities/announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectModel(Announcement.name)
    private announcementModel: Model<AnnouncementDocument>,
  ) {}
  async create(
    createAnnouncementDto: CreateAnnouncementDto,
  ): Promise<Announcement> {
    const announcement = new this.announcementModel(createAnnouncementDto);
    return announcement.save();
  }

  async findAll(): Promise<Announcement[]> {
    const date = new Date();
    const announcements = await this.announcementModel.find().exec();
    const expiredAnnouncements = announcements.filter(
      (announcement) => announcement.expires < date,
    );

    await Promise.all(
      expiredAnnouncements.map(async (announcement) => {
        await this.remove(announcement.id as string);
      }),
    );

    return this.announcementModel.find().exec();
  }

  async remove(id: string): Promise<Announcement> {
    const announcement = await this.announcementModel.findByIdAndDelete(id);
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }
    return announcement;
  }
}
