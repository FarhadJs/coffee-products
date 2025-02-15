// src/auth/entities/user.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../common/enums/user-role.enum';
import { Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      ret.id = (ret._id as Types.ObjectId).toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.STAFF })
  role: UserRole;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  phoneNumber?: string;

  @Prop()
  address?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLogin?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
