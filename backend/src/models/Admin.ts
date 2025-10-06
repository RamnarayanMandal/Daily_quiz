import mongoose, { Schema, Document, Model } from 'mongoose';

export interface AdminDocument extends Document {
  email: string;
  name?: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<AdminDocument>({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

export const Admin: Model<AdminDocument> =
  mongoose.models.Admin || mongoose.model<AdminDocument>('Admin', AdminSchema);


