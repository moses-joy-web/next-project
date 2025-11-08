import { Schema, model, models, Types } from 'mongoose';

const PostSchema = new Schema(
  {
    author: { type: Types.ObjectId, ref: 'User', required: true },
    text: { type: String },
    imageUrl: { type: String },
    repostOf: { type: Types.ObjectId, ref: 'Post', default: null },
  },
  { timestamps: true }
);

export const Post = models.Post || model('Post', PostSchema);
