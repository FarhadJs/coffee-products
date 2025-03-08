// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ message: string; profile: object; token: string }> {
    const { email, password } = createUserDto;

    const userExists = await this.userModel.findOne({ email });
    if (userExists) {
      throw new ConflictException('Email already exists');
    }

    if (email == 'Amirbaqian@gmail.com') createUserDto.role = 'founder';
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const profile = await this.getProfile(user._id.toString());

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);
    if (email == 'Amirbaqian@gmail.com')
      return {
        message: 'ورودت رو به سیستم کافه ایس تبریک میگم باغیان!',
        profile,
        token,
      };
    return { message: `خوش آمدی ${user.firstName}!`, profile, token };
  }

  async login(loginDto: LoginDto): Promise<{ profile: object; token: string }> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.userModel.updateOne(
      { _id: user._id },
      { lastLogin: new Date() },
    );

    const profile = await this.getProfile(user._id.toString());

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    return { profile, token };
  }

  async validateUser(payload: JwtPayload): Promise<UserDocument> {
    const user = await this.userModel.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async getProfile(userId: string): Promise<Partial<UserDocument>> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    const userObj = user.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, __v, ...result } = userObj;
    return result;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateUserDto,
  ): Promise<Partial<UserDocument>> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    // اگر ایمیل جدید وارد شده، چک کنیم که تکراری نباشد
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({
        email: updateProfileDto.email,
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
      // ایمیل جدید نیاز به تایید دوباره دارد
      user.isEmailVerified = false;
    }

    // اگر پسورد جدید وارد شده، هش کنیم
    if (updateProfileDto.password) {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(updateProfileDto.password, salt);
    }

    // آپدیت سایر فیلدها
    Object.assign(user, {
      ...updateProfileDto,
      password: user.password, // استفاده از پسورد هش شده
    });

    await user.save();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user.toObject();
    return result;
  }
}
