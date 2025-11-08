import { Schema, model, models, Types } from 'mongoose';

const LikeSchema = new Schema(
  {
    post: { type: Types.ObjectId, ref: 'Post', required: true },
    user: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

LikeSchema.index({ post: 1, user: 1 }, { unique: true });

export const Like = models.Like || model('Like', LikeSchema);
