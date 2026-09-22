import mongoose, { Schema, Document } from "mongoose";

export interface IKnowledgeArticle extends Document {
  title: string;
  crop: string;
  category?: string;
  severity: "High" | "Medium" | "Low";
  image?: string;    
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
    category: {
      type: String,
      trim: true
    },
    severity: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium"
    },
    image: {
      type: String,
      trim: true
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