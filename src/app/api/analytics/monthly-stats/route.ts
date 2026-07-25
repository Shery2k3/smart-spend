import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/app/lib/dbConnect";
import Transaction from "@/app/models/Transaction";
import Category from "@/app/models/Category";
import User from "@/app/models/User";
import dayjs from "dayjs";

export async function GET() {
    try {
        await dbConnect();
        const session = await auth();

        if (!session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const startOfMonth = dayjs().startOf("month").toDate().toISOString();

        // Get monthly transactions and all transactions, plus user data
        const monthlyTransactions = await Transaction.find({
            userId: session.user.userId,
            date: { $gte: startOfMonth },
        });

        const allTransactions = await Transaction.find({
            userId: session.user.userId,
        });
        const user = await User.findOne({
            userId: session.user.userId
        });

        // Calculate monthly stats
        const monthlyIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const monthlyExpenses = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        // Get user's monthly budget
        
        const monthlyBudget = Number(user?.monthlyBudget) || 0;

        console.log('Monthly Expenses:', monthlyExpenses);
        console.log('Monthly Budget:', monthlyBudget);

        // Calculate budget utilization percentage (0 if budget is 0)
        const budgetUtilization = monthlyBudget > 0 
            ? (monthlyExpenses / monthlyBudget) * 100 
            : 0;

        // Calculate current balance as net amount of all time (income - expenses)
        const allTimeIncome = allTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const allTimeExpenses = allTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const currentBalance = allTimeIncome - allTimeExpenses;

        const stats = {
            currentBalance,
            monthlyIncome,
            monthlyExpenses,
            budgetUtilization: budgetUtilization.toFixed(2),
        };

        return NextResponse.json(stats);

    } catch (err) {
        return NextResponse.json(
            { error: "Failed to fetch transactions", err },
            { status: 500 }
        );
    }
}

