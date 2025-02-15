import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../common/enums/user-role.enum';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return false;
    }

    switch (user.role) {
      case UserRole.FOUNDER:
        return true;
      case UserRole.ADMIN:
        return !requiredRoles.includes(UserRole.FOUNDER);
      case UserRole.STAFF:
        return requiredRoles.some(
          (role) => role === UserRole.STAFF || role === UserRole.USER,
        );
      case UserRole.USER:
        return requiredRoles.includes(UserRole.USER);
      default:
        return false;
    }
  }
}
