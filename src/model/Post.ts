import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  text: string;
  image?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}


const PostSchema = new Schema<IPost>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // Links to your existing User model
      required: true
    },
    text: {
      type: String,
      required: true
    },
    image: {
      type: String
    },
    tags: [
      {
        type: String // Automatically parsed hashtags like #fall-armyworm
      }
    ]
  },
  {
    timestamps: true
  }
);

const Post = mongoose.model<IPost>("Post", PostSchema);
export default Post;