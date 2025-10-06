import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface DailyResultDocument extends Document {
  userId: Types.ObjectId;
  dateKey: string; // YYYY-MM-DD
  totalPoints: number; // sum of correct answers * 10
  totalSpentSzl: number; // total SZL spent that day
  bestTimeMs?: number; // best time across completed 10/10 sets
}

const DailyResultSchema = new Schema<DailyResultDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  dateKey: { type: String, required: true, index: true },
  totalPoints: { type: Number, default: 0 },
  totalSpentSzl: { type: Number, default: 0 },
  bestTimeMs: { type: Number },
}, { timestamps: true });

DailyResultSchema.index({ dateKey: 1, totalPoints: -1, totalSpentSzl: -1, bestTimeMs: 1 });

export const DailyResult: Model<DailyResultDocument> =
  mongoose.models.DailyResult || mongoose.model<DailyResultDocument>('DailyResult', DailyResultSchema);


