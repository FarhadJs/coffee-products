import { Request } from 'express';
import { UserDocument } from '../../auth/entities/user.entity';

export interface RequestWithUser extends Request {
  user: UserDocument;
}
