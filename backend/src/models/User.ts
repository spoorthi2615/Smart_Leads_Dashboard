import bcrypt from 'bcryptjs';
import type { Document } from 'mongoose';
import { model, Schema } from 'mongoose';

export type UserRole = 'Admin' | 'Sales User';

export interface IUser extends Document {
  name: string;
  email: string;
  role: UserRole;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['Admin', 'Sales User'],
      default: 'Sales User',
    },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

userSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>('User', userSchema);
