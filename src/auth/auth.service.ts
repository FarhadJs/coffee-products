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
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ token: string }> {
    const { email, password } = createUserDto;

    const userExists = await this.userModel.findOne({ email });
    if (userExists) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
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

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    return { token };
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

  async createAdmin(createUserDto: CreateUserDto): Promise<{ token: string }> {
    const { email, password } = createUserDto;

    const userExists = await this.userModel.findOne({ email });
    if (userExists) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    return { token };
  }
}
