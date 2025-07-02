import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  stocks: string[];
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    stocks: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Prevent model overwrite in dev
export const User = models.User || mongoose.model<IUser>("User", UserSchema);
