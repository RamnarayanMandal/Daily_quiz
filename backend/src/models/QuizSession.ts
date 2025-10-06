import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface AnswerItem {
  questionId: Types.ObjectId;
  chosenIndex: number;
  correct: boolean;
}

export interface QuizSessionDocument extends Document {
  userId: Types.ObjectId;
  questionIds: Types.ObjectId[];
  answers: AnswerItem[];
  startedAt: Date;
  completedAt?: Date;
  totalCorrect: number; // 0..10 when completed
  totalTimeMs?: number; // completion time
  paid: boolean; // whether this set was paid
  dateKey: string; // YYYY-MM-DD for daily scope
}

const AnswerSchema = new Schema<AnswerItem>({
  questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  chosenIndex: { type: Number, required: true, min: 0, max: 3 },
  correct: { type: Boolean, required: true },
});

const QuizSessionSchema = new Schema<QuizSessionDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question', required: true }],
  answers: { type: [AnswerSchema], default: [] },
  startedAt: { type: Date, default: () => new Date() },
  completedAt: { type: Date },
  totalCorrect: { type: Number, default: 0 },
  totalTimeMs: { type: Number },
  paid: { type: Boolean, default: false },
  dateKey: { type: String, required: true, index: true },
});

export const QuizSession: Model<QuizSessionDocument> =
  mongoose.models.QuizSession || mongoose.model<QuizSessionDocument>('QuizSession', QuizSessionSchema);


