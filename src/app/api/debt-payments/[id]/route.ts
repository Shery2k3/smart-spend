import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/app/lib/dbConnect';
import Debt from '@/app/models/Debt';
import Transaction from '@/app/models/Transaction';
import Category from '@/app/models/Category';
import { Types } from 'mongoose';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PUT - Update a specific debt payment transaction
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await dbConnect();
    const session = await auth();
    
    if (!session?.user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: transactionId } = await params;
    const body = await request.json();
    const { debtId, type, amount, date, notes, reason, category } = body;

    if (!debtId || !transactionId) {
      return NextResponse.json(
        { error: 'Debt ID and Transaction ID are required' }, 
        { status: 400 }
      );
    }

    // Find the debt and verify ownership
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

    // Find the existing transaction
    const existingTransaction = debt.transactions.find(
      (t: { _id: Types.ObjectId }) => t._id.toString() === transactionId
    );

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' }, 
        { status: 404 }
      );
    }

    // Calculate the difference in amounts for debt recalculation
    const oldAmount = existingTransaction.amount;
    const oldType = existingTransaction.type;
    const newAmount = amount ?? oldAmount;
    const newType = type ?? oldType;

    // Reverse the old transaction effect
    let amountPaidDelta = 0;
    let totalAmountDelta = 0;
    let amountRemainingDelta = 0;

    // Reverse old effect
    if (oldType === 'return') {
      amountPaidDelta -= oldAmount;
      amountRemainingDelta += oldAmount;
    } else {
      totalAmountDelta -= oldAmount;
      amountRemainingDelta -= oldAmount;
    }

    // Apply new effect
    if (newType === 'return') {
      amountPaidDelta += newAmount;
      amountRemainingDelta -= newAmount;
    } else {
      totalAmountDelta += newAmount;
      amountRemainingDelta += newAmount;
    }

    // Validate that the new remaining amount won't be negative
    const newRemainingAmount = debt.amountRemaining + amountRemainingDelta;
    if (newType === 'return' && newRemainingAmount < 0) {
      return NextResponse.json(
        { error: 'Return amount cannot exceed remaining amount' }, 
        { status: 400 }
      );
    }

    // Update the linked Transaction if it exists
    if (existingTransaction.transactionId) {
      const oldTransactionType = debt.debtType === 'taken' 
        ? (oldType === 'add' ? 'income' : 'expense')
        : (oldType === 'add' ? 'expense' : 'income');
      
      const newTransactionType = debt.debtType === 'taken'
        ? (newType === 'add' ? 'income' : 'expense')
        : (newType === 'add' ? 'expense' : 'income');

      const oldCategory = existingTransaction.category;
      const newCategory = category ?? oldCategory;

      // If category changed and old was expense, reverse old category stats
      if (oldTransactionType === 'expense' && oldCategory && 
          (newCategory !== oldCategory || newTransactionType !== oldTransactionType || newAmount !== oldAmount)) {
        await Category.findOneAndUpdate(
          { 
            userId: session.user.userId,
            categoryName: oldCategory 
          },
          { 
            $inc: { 
              totalSpend: -oldAmount,
              transactionCount: -1
            } 
          }
        );
      }

      // Update the Transaction
      await Transaction.findByIdAndUpdate(
        existingTransaction.transactionId,
        {
          type: newTransactionType,
          amount: newAmount,
          date: date ?? existingTransaction.date,
          category: newCategory,
          notes: notes ?? existingTransaction.notes
        }
      );

      // If new transaction is expense, update category stats
      if (newTransactionType === 'expense' && newCategory) {
        await Category.findOneAndUpdate(
          { 
            userId: session.user.userId,
            categoryName: newCategory 
          },
          { 
            $inc: { 
              totalSpend: newAmount,
              transactionCount: 1
            } 
          }
        );
      }
    }

    // Update the transaction in the array
    const updateData: Record<string, any> = {};
    if (type !== undefined) updateData['transactions.$.type'] = type;
    if (amount !== undefined) updateData['transactions.$.amount'] = amount;
    if (date !== undefined) updateData['transactions.$.date'] = date;
    if (notes !== undefined) updateData['transactions.$.notes'] = notes;
    if (reason !== undefined) updateData['transactions.$.reason'] = reason;
    if (category !== undefined) updateData['transactions.$.category'] = category;

    const updatedDebt = await Debt.findOneAndUpdate(
      {
        _id: debtId,
        userId: session.user.userId,
        'transactions._id': new Types.ObjectId(transactionId)
      },
      {
        $set: updateData,
        $inc: {
          amountPaid: amountPaidDelta,
          totalAmount: totalAmountDelta,
          amountRemaining: amountRemainingDelta
        }
      },
      { new: true }
    );

    // Update status based on remaining amount
    if (updatedDebt) {
      const newStatus = updatedDebt.amountRemaining <= 0 ? 'completed' : 'active';
      if (updatedDebt.status !== newStatus) {
        await Debt.findByIdAndUpdate(debtId, { $set: { status: newStatus } });
      }
    }

    return NextResponse.json({
      message: 'Payment updated successfully',
      debt: updatedDebt
    });
  } catch (err) {
    console.error('Error updating debt payment:', err);
    return NextResponse.json(
      { error: 'Failed to update payment', details: err }, 
      { status: 400 }
    );
  }
}

// DELETE - Delete a specific debt payment transaction
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await dbConnect();
    const session = await auth();
    
    if (!session?.user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: transactionId } = await params;
    const { searchParams } = new URL(request.url);
    const debtId = searchParams.get('debtId');

    if (!debtId || !transactionId) {
      return NextResponse.json(
        { error: 'Debt ID and Transaction ID are required' }, 
        { status: 400 }
      );
    }

    // Find the debt and verify ownership
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

    // Find the transaction to be deleted
    const transactionToDelete = debt.transactions.find(
      (t: { _id: Types.ObjectId }) => t._id.toString() === transactionId
    );

    if (!transactionToDelete) {
      return NextResponse.json(
        { error: 'Transaction not found' }, 
        { status: 404 }
      );
    }

    // Delete the linked Transaction if it exists
    if (transactionToDelete.transactionId) {
      const linkedTransaction = await Transaction.findById(transactionToDelete.transactionId);
      
      if (linkedTransaction) {
        // Update category if it was an expense
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
        await Transaction.findByIdAndDelete(transactionToDelete.transactionId);
      }
    }

    // Calculate the reversal amounts
    let amountPaidDelta = 0;
    let totalAmountDelta = 0;
    let amountRemainingDelta = 0;

    if (transactionToDelete.type === 'return') {
      amountPaidDelta = -transactionToDelete.amount;
      amountRemainingDelta = transactionToDelete.amount;
    } else {
      totalAmountDelta = -transactionToDelete.amount;
      amountRemainingDelta = -transactionToDelete.amount;
    }

    // Remove the transaction and update amounts
    const updatedDebt = await Debt.findByIdAndUpdate(
      debtId,
      {
        $pull: { transactions: { _id: new Types.ObjectId(transactionId) } },
        $inc: {
          amountPaid: amountPaidDelta,
          totalAmount: totalAmountDelta,
          amountRemaining: amountRemainingDelta
        }
      },
      { new: true }
    );

    // Update status based on remaining amount
    if (updatedDebt) {
      const newStatus = updatedDebt.amountRemaining <= 0 ? 'completed' : 'active';
      if (updatedDebt.status !== newStatus) {
        await Debt.findByIdAndUpdate(debtId, { $set: { status: newStatus } });
      }
    }

    return NextResponse.json({
      message: 'Payment deleted successfully',
      debt: updatedDebt
    });
  } catch (err) {
    console.error('Error deleting debt payment:', err);
    return NextResponse.json(
      { error: 'Failed to delete payment', details: err }, 
      { status: 500 }
    );
  }
}
