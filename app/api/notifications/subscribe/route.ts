import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

import { removePushSubscription, savePushSubscription } from '@/lib/database/pushSubscriptions';

const SubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

const DeleteParamsSchema = z.object({
  endpoint: z.string().url(),
});

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const subscription = SubscriptionSchema.parse(body);

    await savePushSubscription({
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid subscription data', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to register push subscription' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const params = DeleteParamsSchema.parse(Object.fromEntries(new URL(request.url).searchParams));

    await removePushSubscription(params.endpoint);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request parameters', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }
}
