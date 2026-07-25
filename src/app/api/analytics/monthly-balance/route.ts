import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/app/lib/dbConnect';
import Transaction from '@/app/models/Transaction';
import dayjs from 'dayjs';

export async function GET() {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    /// Calculate date 6 months ago
    const sixMonthsAgo = dayjs().subtract(6, 'month').startOf('month').toDate().toISOString();

    const transactions = await Transaction.find({
      userId: session.user.userId,
      date: { $gte: sixMonthsAgo }
    });

    // Group and calculate monthly balances and expenditures
    const monthlyBalances = new Map();
    const monthlyExpenditures = new Map();

    transactions.forEach(transaction => {
      const month = dayjs(transaction.date).format('MMM'); // Get month abbreviation
      const amount = transaction.amount * (transaction.type === 'expense' ? -1 : 1);

      monthlyBalances.set(
        month,
        (monthlyBalances.get(month) || 0) + amount
      );

      // Track expenditures separately
      if (transaction.type === 'expense') {
        monthlyExpenditures.set(
          month,
          (monthlyExpenditures.get(month) || 0) + transaction.amount
        );
      }
    });

    // Create array of last 6 months in order
    const monthsData = Array.from({ length: 6 }, (_, i) => {
      const month = dayjs().subtract(i, 'month').format('MMM');
      return {
        month,
        saving: Math.round((monthlyBalances.get(month) || 0) * 100) / 100,
        expenditure: Math.round((monthlyExpenditures.get(month) || 0) * 100) / 100
      };
    }).reverse();

    return NextResponse.json(monthsData);

  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch monthly balances', err },
      { status: 500 }
    );
  }
}