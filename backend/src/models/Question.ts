import mongoose, { Schema, Document, Model } from 'mongoose';

export interface QuestionDocument extends Document {
  text: string;
  options: string[]; // 4 options
  correctIndex: number; // 0..3
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const QuestionSchema = new Schema<QuestionDocument>(
  {
    text: { type: String, required: true },
    options: { type: [String], required: true, validate: (v: string[]) => v.length === 4 },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    category: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  },
  { timestamps: true }
);

export const Question: Model<QuestionDocument> =
  mongoose.models.Question || mongoose.model<QuestionDocument>('Question', QuestionSchema);


