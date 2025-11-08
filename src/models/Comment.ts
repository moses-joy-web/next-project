import { Schema, model, models, Types } from 'mongoose';

const CommentSchema = new Schema(
  {
    post: { type: Types.ObjectId, ref: 'Post', required: true },
    author: { type: Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export const Comment = models.Comment || model('Comment', CommentSchema);
