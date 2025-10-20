# Push Notifications Setup Guide

This guide explains how to set up and use the push notification system for the Weather App.

## 🚀 Quick Start

### 1. Environment Variables

Add these to your `.env.local` file:

```bash
# VAPID Keys for Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key_here
VAPID_PRIVATE_KEY=your_vapid_private_key_here
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${VAPID_PUBLIC_KEY}

# OpenWeather API Key
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Database URL
DATABASE_URL=your_database_url_here
```

### 2. Generate VAPID Keys

Run this command to generate VAPID keys:

```bash
npx web-push generate-vapid-keys
```

Copy the generated keys to your `.env.local` file.

### 3. Database Migration

Run the Prisma migration to create the PushSubscription table:

```bash
npx prisma migrate dev --name add_push_subscriptions
npx prisma generate
```

### 4. Deploy

Deploy your application with the environment variables set in your hosting platform.

## 📱 How It Works

### User Flow

1. **User enables notifications** in Settings
2. **Browser requests permission** for notifications
3. **Service worker registers** and creates push subscription
4. **Subscription saved** to database with user ID
5. **Cron jobs trigger** twice daily (7:30 AM & 7:30 PM)
6. **Weather data fetched** for user's main city
7. **Notifications sent** to all subscribed users

### Database Schema

```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String?  // Clerk user ID if available
  endpoint  String   @unique
  p256dh    String
  auth      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([endpoint])
}
```

## 🔧 API Endpoints

### POST /api/notifications/subscribe
Subscribe a user to push notifications.

**Request:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "base64-encoded-key",
    "auth": "base64-encoded-key"
  },
  "userId": "user-id-optional"
}
```

### DELETE /api/notifications/subscribe
Unsubscribe a user from push notifications.

**Request:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

### POST /api/notifications/send
Send notifications to all subscribed users (called by cron).

**Request:**
```json
{
  "timeOfDay": "morning" // or "evening"
}
```

### GET /api/notifications/user-city?userId=xxx
Get user's main city for notifications.

### POST /api/notifications/test
Test endpoint to manually trigger notifications.

## ⏰ Cron Jobs

The system uses Vercel cron jobs to send notifications twice daily:

```json
{
  "crons": [
    {
      "path": "/api/notifications/send",
      "schedule": "30 4 * * *"  // 7:30 AM Israel time
    },
    {
      "path": "/api/notifications/send", 
      "schedule": "30 16 * * *" // 7:30 PM Israel time
    }
  ]
}
```

## 🧪 Testing

### Local Testing

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open Chrome/Edge** (Firefox has limited support)

3. **Enable notifications** in Settings

4. **Test manually:**
   ```bash
   curl -X POST http://localhost:3000/api/notifications/test
   ```

### Production Testing

1. **Deploy with environment variables**

2. **Test subscription:**
   - Enable notifications in the app
   - Check database for new PushSubscription record

3. **Test sending:**
   - Call the test endpoint or wait for cron job
   - Check browser for notification

## 🔍 Troubleshooting

### Common Issues

1. **"VAPID keys not found"**
   - Ensure VAPID keys are set in environment variables
   - Check that keys are properly generated

2. **"Service worker registration failed"**
   - Ensure `/public/sw.js` exists
   - Check browser console for errors

3. **"No notifications received"**
   - Check if user has cities added
   - Verify OpenWeather API key is valid
   - Check database for subscription records

4. **"Permission denied"**
   - User must manually enable notifications in browser
   - Check browser notification settings

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

## 📊 Monitoring

### Database Queries

Check subscription status:
```sql
SELECT COUNT(*) FROM "PushSubscription";
SELECT * FROM "PushSubscription" WHERE "userId" IS NOT NULL;
```

### Logs

Monitor these logs:
- Push subscription creation/removal
- Notification sending success/failure
- Invalid subscription cleanup

## 🔒 Security

### Best Practices

1. **VAPID keys** are environment-specific
2. **User IDs** are validated before database operations
3. **Rate limiting** prevents abuse
4. **Invalid subscriptions** are automatically cleaned up

### Privacy

- **No personal data** stored in notifications
- **User consent** required for notifications
- **Easy unsubscribe** via settings

## 🚀 Production Deployment

### Vercel

1. **Set environment variables** in Vercel dashboard
2. **Deploy** with `vercel.json` cron configuration
3. **Monitor** cron job execution in Vercel dashboard

### Other Platforms

1. **Set up cron jobs** to call `/api/notifications/send`
2. **Configure environment variables**
3. **Test** notification delivery

## 📈 Performance

### Optimization

- **Batch processing** of notifications
- **Error handling** for failed deliveries
- **Automatic cleanup** of invalid subscriptions
- **Caching** of weather data

### Limits

- **OpenWeather API** rate limits apply
- **Browser notification** limits vary by platform
- **Database** connection limits

## 🔄 Maintenance

### Regular Tasks

1. **Monitor** notification delivery rates
2. **Clean up** invalid subscriptions
3. **Update** VAPID keys if needed
4. **Review** error logs

### Updates

When updating the system:
1. **Test** in development first
2. **Deploy** during low-traffic periods
3. **Monitor** for issues
4. **Rollback** if necessary

---

For more information, see the main project documentation or contact the development team.
