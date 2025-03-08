import { Request } from 'express';
import { UserDocument } from '../../users/entities/user.entity';

export interface RequestWithUser extends Request {
  user: UserDocument;
}
