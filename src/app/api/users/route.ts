import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/models/User';

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const user = await User.findOne({ userId });
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch user', err }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const { userId, name, currency, monthlyBudget } = body;

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { 
        $set: {
          name, 
          currency, 
          monthlyBudget: Number(monthlyBudget)
        }
      },
      { 
        new: true,
        runValidators: true,
        strict: false
      }
    );
    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json({ error: 'Failed to update user', err }, { status: 400 });
  }
}