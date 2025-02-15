import { ObjectId } from 'mongoose';

export interface AdminVerification {
  _id: ObjectId;
  userId: ObjectId;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
}
