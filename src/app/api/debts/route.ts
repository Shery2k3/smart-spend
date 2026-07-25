import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/app/lib/dbConnect';
import Debt from '@/app/models/Debt';
import Category from '@/app/models/Category';
import Transaction from '@/app/models/Transaction';

// GET - Fetch all debts for the user
export async function GET(request: Request) {
  try {
    await dbConnect();
    const session = await auth();
    
    if (!session?.user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const debtType = searchParams.get('debtType'); // 'given' | 'taken'
    const status = searchParams.get('status'); // 'active' | 'completed'
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // Build query object
    const query: { 
      userId: string; 
      debtType?: "given" | "taken";
      status?: "active" | "completed";
    } = {
      userId: session.user.userId
    };

    if (debtType && ['given', 'taken'].includes(debtType)) {
      query.debtType = debtType as "given" | "taken";
    }

    if (status && ['active', 'completed'].includes(status)) {
      query.status = status as "active" | "completed";
    }

    // Get total count for pagination
    const total = await Debt.countDocuments(query);

    // Get paginated debts
    const debts = await Debt.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return NextResponse.json({
      debts,
      pagination: {
        current: page,
        pageSize,
        total
      }
    });
  } catch (err) {
    console.error('Error fetching debts:', err);
    return NextResponse.json(
      { error: 'Failed to fetch debts', details: err }, 
      { status: 500 }
    );
  }
}

// POST - Create a new debt
export async function POST(request: Request) {
  try {
    await dbConnect();
    const session = await auth();
    
    if (!session?.user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const { title, totalAmount, debtType, date, notes } = body;

    if (!title || !totalAmount || !debtType || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: title, totalAmount, debtType, date' }, 
        { status: 400 }
      );
    }

    // Create a transaction in the Transaction collection
    const transactionType = 'expense';
    const transaction = await Transaction.create({
      userId: session.user.userId,
      title: notes || title,
      type: transactionType,
      amount: totalAmount,
      date: date,
      category: body.category,
      notes: notes || 'Initial debt creation'
    });

    // Update category if it's an expense
    if (transactionType === 'expense' && body.category) {
      await Category.findOneAndUpdate(
        { 
          userId: session.user.userId,
          categoryName: body.category 
        },
        { 
          $inc: { 
            totalSpend: totalAmount,
            transactionCount: 1
          } 
        }
      );
    }

    // Create initial transaction for the debt with reference to Transaction
    const initialTransaction = {
      type: 'add' as const,
      amount: totalAmount,
      date: date,
      category: body.category,
      reason: notes || 'Initial debt creation',
      transactionId: transaction._id.toString()
    };

    const debt = await Debt.create({
      userId: session.user.userId,
      title,
      totalAmount,
      amountPaid: 0,
      amountRemaining: totalAmount,
      debtType,
      date,
      status: 'active',
      transactions: [initialTransaction],
      notes
    });

    return NextResponse.json(debt, { status: 201 });
  } catch (err) {
    console.error('Error creating debt:', err);
    return NextResponse.json(
      { error: 'Failed to create debt', details: err }, 
      { status: 400 }
    );
  }
}

// PUT - Update a debt
export async function PUT(request: Request) {
  try {
    await dbConnect();
    const session = await auth();
    
    if (!session?.user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const debtId = searchParams.get('id');

    if (!debtId) {
      return NextResponse.json(
        { error: 'Debt ID is required' }, 
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Find and verify ownership
    const existingDebt = await Debt.findOne({
      _id: debtId,
      userId: session.user.userId
    });

    if (!existingDebt) {
      return NextResponse.json(
        { error: 'Debt not found or unauthorized' }, 
        { status: 404 }
      );
    }

    // Only allow updating certain fields
    const allowedUpdates = ['title', 'totalAmount', 'debtType', 'date', 'status', 'notes'];
    const updates: Record<string, any> = {};
    
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    // If totalAmount is being updated, recalculate amountRemaining
    if (updates.totalAmount !== undefined) {
      updates.amountRemaining = updates.totalAmount - existingDebt.amountPaid;
    }

    const updatedDebt = await Debt.findByIdAndUpdate(
      debtId,
      { $set: updates },
      { new: true }
    );

    return NextResponse.json(updatedDebt);
  } catch (err) {
    console.error('Error updating debt:', err);
    return NextResponse.json(
      { error: 'Failed to update debt', details: err }, 
      { status: 400 }
    );
  }
}

// DELETE - Delete a debt
export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const session = await auth();
    
    if (!session?.user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const debtId = searchParams.get('id');

    if (!debtId) {
      return NextResponse.json(
        { error: 'Debt ID is required' }, 
        { status: 400 }
      );
    }

    // Find and verify ownership before deleting
    const debt = await Debt.findOne({
      _id: debtId,
      userId: session.user.userId
    });

    if (!debt) {
      return NextResponse.json(
        { error: 'Debt not found or unauthorized' }, 
        { status: 404 }
      );
    }

    // Delete all linked transactions from Transaction collection
    for (const debtTransaction of debt.transactions) {
      if (debtTransaction.transactionId) {
        const linkedTransaction = await Transaction.findById(debtTransaction.transactionId);
        
        if (linkedTransaction) {
          // Reverse category totals if it was an expense
          if (linkedTransaction.type === 'expense' && linkedTransaction.category) {
            await Category.findOneAndUpdate(
              { 
                userId: session.user.userId,
                categoryName: linkedTransaction.category 
              },
              { 
                $inc: { 
                  totalSpend: -linkedTransaction.amount,
                  transactionCount: -1
                } 
              }
            );
          }
          
          // Delete the transaction
          await Transaction.findByIdAndDelete(debtTransaction.transactionId);
        }
      }
    }

    // Now delete the debt
    await Debt.findByIdAndDelete(debtId);

    return NextResponse.json({ 
      message: 'Debt deleted successfully',
      deletedDebt: debt 
    });
  } catch (err) {
    console.error('Error deleting debt:', err);
    return NextResponse.json(
      { error: 'Failed to delete debt', details: err }, 
      { status: 500 }
    );
  }
}
