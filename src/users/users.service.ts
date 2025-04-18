import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async create(createUserDto: CreateUserDto) {
    const user = await this.userModel.create(createUserDto);
    return { message: 'کاربر با موفقیت ثبت شد', data: user };
  }

  async findAll() {
    const users = await this.userModel.find().select('-password');
    return { data: users };
  }

  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('user not found!');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.imagePath == '') delete updateUserDto.imagePath;
    const updated_user = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true },
    );
    if (!updated_user) {
      throw new BadRequestException('خطا در بروزرسانی تغییرات');
    }
    return { message: 'تغییرات با موفقیت اعمال شد', data: updated_user };
  }

  async remove(id: string) {
    const deleted_user = await this.userModel.findByIdAndDelete(id).exec();
    if (!deleted_user) {
      throw new BadRequestException('خطا در حذف کاربر');
    }
    return { message: 'کاربر با موفقیت حذف شد', data: deleted_user };
  }
}
