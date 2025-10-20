import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  try {
    // This is a test endpoint to manually trigger notifications
    // In production, notifications are sent via GitHub Actions calling /api/notifications/dispatch
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeOfDay: 'morning', // or 'evening'
      }),
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Test notification sent',
      result,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}
