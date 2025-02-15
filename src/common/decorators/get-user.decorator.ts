import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from '../../auth/entities/user.entity';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserDocument => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
