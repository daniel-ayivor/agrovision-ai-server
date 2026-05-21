import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  emailVerified?: boolean;
  verificationToken?: string;
  profileImage?: string;
  refreshToken?: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["farmer", "admin", "agricultural_officer"],
      default: "farmer"
    },

emailVerified: {
  type: Boolean,
  default: false
},

    verificationToken: {
      type: String
    },

    profileImage: {
      type: String
    },

    refreshToken: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;