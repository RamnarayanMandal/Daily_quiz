import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface DailySelectionDocument extends Document {
  dateKey: string; // YYYY-MM-DD
  questionIds: Types.ObjectId[]; // exactly 10
}

const DailySelectionSchema = new Schema<DailySelectionDocument>({
  dateKey: { type: String, required: true, unique: true, index: true },
  questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question', required: true }],
});

export const DailySelection: Model<DailySelectionDocument> =
  mongoose.models.DailySelection || mongoose.model<DailySelectionDocument>('DailySelection', DailySelectionSchema);


