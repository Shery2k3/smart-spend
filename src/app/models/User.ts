import { Schema, model, models } from 'mongoose';

interface IUser {
  userId: string;
  name: string;
  email: string;
  password?: string;
  image?: string;
  currency: string;
  monthlyBudget: number;
}

const userSchema = new Schema<IUser>({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false }, 
  image: { type: String },
  currency: { type: String, default: 'USD' },
  monthlyBudget: { type: Number, default: 0 }
});

export default models.User || model<IUser>('User', userSchema);