import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type TransactionType = 'TOP_UP' | 'SET_PURCHASE' | 'SMS_TOP_UP';

export interface TransactionDocument extends Document {
  userId: Types.ObjectId;
  amountSzl: number; // 1 SZL per 10 question set
  creditsAdded: number; // how many sets added
  type: TransactionType;
  externalId?: string; // payment or sms ref
  createdAt: Date;
}

const TransactionSchema = new Schema<TransactionDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amountSzl: { type: Number, required: true },
  creditsAdded: { type: Number, required: true },
  type: { type: String, enum: ['TOP_UP', 'SET_PURCHASE', 'SMS_TOP_UP'], required: true },
  externalId: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Transaction: Model<TransactionDocument> =
  mongoose.models.Transaction || mongoose.model<TransactionDocument>('Transaction', TransactionSchema);


