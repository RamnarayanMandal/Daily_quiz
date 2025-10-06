import mongoose, { Schema, Document, Model } from 'mongoose';

export interface UserDocument extends Document {
  phone: string;
  displayName?: string;
  email?: string;
  passwordHash?: string; // for email-based login
  credits: number; // number of paid 10-question sets available
  freeChainActive: boolean; // next set is free if true
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    phone: { type: String, required: true, unique: true, index: true },
    displayName: { type: String },
    email: { type: String, index: true },
    passwordHash: { type: String },
    credits: { type: Number, default: 0 },
    freeChainActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);


