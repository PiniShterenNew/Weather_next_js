import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { savePushSubscription, removePushSubscription } from '@/lib/database/pushSubscriptions';

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const subscription = subscriptionSchema.parse(body);

    // eslint-disable-next-line no-console
    console.log('Push subscription received:', {
      endpoint: subscription.endpoint,
      userId: subscription.userId,
      keysPresent: !!subscription.keys
    });

    // Save to database
    const result = await savePushSubscription({
      userId: subscription.userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    });

    // eslint-disable-next-line no-console
    console.log('Push subscription saved:', result);

    return NextResponse.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error processing push subscription:', error);
    return NextResponse.json(
      { error: 'Invalid subscription data' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required' },
        { status: 400 }
      );
    }

    // Remove from database
    await removePushSubscription(endpoint);

    // eslint-disable-next-line no-console
    console.log('Push subscription removed:', endpoint);

    return NextResponse.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error removing push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}
