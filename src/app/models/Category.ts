import {Schema, model, models} from 'mongoose';

interface ICategory {
    userId: string;
    categoryName: string;
    totalSpend: number;
    budget: number;
    transactionCount: number;
    color?: string
}

const categorySchema = new Schema<ICategory>({
    userId: { type: String, required: true },
    categoryName: { type: String, required: true },
    totalSpend: { type: Number, required: true },
    budget: { type: Number, required: true },
    transactionCount: { type: Number, required: true },
    color: { type: String, required: false }
});

// Compound unique index to allow same category names for different users
categorySchema.index({ userId: 1, categoryName: 1 }, { unique: true });

export default models.Category || model<ICategory>('Category', categorySchema);