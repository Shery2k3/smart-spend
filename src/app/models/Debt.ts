import { Schema, model, models, Types } from 'mongoose';

export interface IDebtTransaction {
    _id?: Types.ObjectId;
    type: "return" | "add";
    amount: number;
    date: string;
    notes?: string;
    reason?: string;
    category?: string;
    transactionId?: string; // Reference to Transaction collection
}

export interface IDebt {
    _id?: string;
    userId: string;
    title: string;
    totalAmount: number;
    amountPaid: number;
    amountRemaining: number;
    debtType: "given" | "taken";
    date: string;
    status: "active" | "completed";
    transactions: IDebtTransaction[];
}

const debtTransactionSchema = new Schema<IDebtTransaction>({
    type: { 
        type: String, 
        required: true, 
        enum: ["return", "add"] 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    date: { 
        type: String, 
        required: true 
    },
    notes: String,
    reason: String,
    category: String,
    transactionId: String
});

const debtSchema = new Schema<IDebt>({
    userId: { 
        type: String, 
        required: true,
        index: true
    },
    title: { 
        type: String, 
        required: true 
    },
    totalAmount: { 
        type: Number, 
        required: true 
    },
    amountPaid: { 
        type: Number, 
        required: true,
        default: 0 
    },
    amountRemaining: { 
        type: Number, 
        required: true 
    },
    debtType: { 
        type: String, 
        required: true, 
        enum: ["given", "taken"] 
    },
    date: { 
        type: String, 
        required: true 
    },
    status: {
        type: String,
        required: true,
        enum: ["active", "completed"],
        default: "active"
    },
    transactions: [debtTransactionSchema]
}, {
    timestamps: true
});

// Index for common queries
debtSchema.index({ userId: 1, debtType: 1, status: 1 });

export default models.Debt || model<IDebt>('Debt', debtSchema);
