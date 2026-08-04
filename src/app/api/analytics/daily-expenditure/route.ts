import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/app/lib/dbConnect";
import Transaction from "@/app/models/Transaction";
import dayjs from "dayjs";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") === "year" ? "year" : "30d";
    const days = range === "year" ? 365 : 30;

    const startDate = dayjs()
      .subtract(days - 1, "day")
      .startOf("day")
      .toDate()
      .toISOString();

    const transactions = await Transaction.find({
      userId: session.user.userId,
      type: "expense",
      date: { $gte: startDate },
    });

    // Group expenditure by day
    const dailyExpenditure = new Map<string, number>();

    transactions.forEach((transaction) => {
      const day = dayjs(transaction.date).format("YYYY-MM-DD");
      dailyExpenditure.set(
        day,
        (dailyExpenditure.get(day) || 0) + transaction.amount,
      );
    });

    // Build array for the range in order, filling gaps with 0
    const dailyData = Array.from({ length: days }, (_, i) => {
      const date = dayjs().subtract(days - 1 - i, "day");
      const key = date.format("YYYY-MM-DD");
      return {
        date: key,
        label: date.format("D MMM"),
        expenditure: Math.round((dailyExpenditure.get(key) || 0) * 100) / 100,
      };
    });

    return NextResponse.json(dailyData);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch daily expenditure", err },
      { status: 500 },
    );
  }
}
