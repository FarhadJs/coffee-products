import {
  Controller,
  Post,
  Patch,
  Body,
  Get,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@GetUser() user: User) {
    return this.authService.getProfile(user._id.toString());
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @GetUser() user: User,
    @Body(ValidationPipe) updateProfileDto: UpdateUserDto,
  ) {
    return this.authService.updateProfile(
      user._id.toString(),
      updateProfileDto,
    );
  }
}
