import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(_request: NextRequest) {
  try {
    // Find all subscriptions with placeholder userId - keeping for reference but not used in logic

    // Find the real user
    const realUser = await prisma.user.findFirst({
      where: {
        email: {
          contains: 'pini5192'
        }
      }
    });

    if (!realUser) {
      return NextResponse.json(
        { error: 'Real user not found' },
        { status: 404 }
      );
    }

    // Update all invalid subscriptions to use the real user's clerkId
    const updateResult = await prisma.pushSubscription.updateMany({
      where: {
        userId: 'current-user-id'
      },
      data: {
        userId: realUser.clerkId
      }
    });

    return NextResponse.json({
      success: true,
      message: `Updated ${updateResult.count} subscriptions`,
      updatedSubscriptions: updateResult.count,
      realUserId: realUser.clerkId,
      realUserEmail: realUser.email
    });

  } catch (error) {
    // Log only in development
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Error fixing subscriptions:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fix subscriptions' },
      { status: 500 }
    );
  }
}
