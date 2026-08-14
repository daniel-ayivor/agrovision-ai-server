import mongoose, { Schema, Document } from "mongoose";

export interface IKnowledgeArticle extends Document {
  title: string;
  crop: string;
  severity: "High" | "Medium" | "Low";
  content?: string;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeArticleSchema: Schema = new Schema<IKnowledgeArticle>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    crop: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium"
    },
    content: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const KnowledgeArticle = mongoose.models.KnowledgeArticle || 
  mongoose.model<IKnowledgeArticle>("KnowledgeArticle", KnowledgeArticleSchema);

export default KnowledgeArticle;