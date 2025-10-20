import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(_request: NextRequest) {
  try {
    // Delete all subscriptions with invalid userId
    const result = await prisma.pushSubscription.deleteMany({
      where: {
        userId: 'current-user-id'
      }
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Deleted ${result.count} invalid subscriptions`
    });

  } catch (error) {
    // Log only in development
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Error cleaning up subscriptions:', error);
    }
    return NextResponse.json(
      { error: 'Failed to cleanup subscriptions' },
      { status: 500 }
    );
  }
}
