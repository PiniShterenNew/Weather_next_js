# 🔐 Clerk Authentication Setup Guide

## ✅ מה כבר הותקן

כל הקוד והאינטגרציה של Clerk כבר מוכנים! צריך רק להגדיר את החשבון ולהוסיף את המפתחות.

### מה כבר מוכן:
- ✅ `@clerk/nextjs` ו-`@clerk/localizations` מותקנים
- ✅ `ClerkProvider` משולב ב-layout עם תמיכה בעברית ואנגלית
- ✅ Middleware מוגדר עם הגנה על `/settings` ו-`/profile`
- ✅ דפי sign-in ו-sign-up מוכנים
- ✅ API endpoints לסנכרון משתמש (`/api/user/sync`, `/api/user/preferences`)
- ✅ `useUserSync` hook מחובר ל-layout
- ✅ מבנה `features/auth/` מלא עם כל הקומפוננטות

---

## 🚀 הוראות הפעלה (3 צעדים)

### שלב 1: צור חשבון Clerk

1. גש ל-https://clerk.com
2. הירשם / התחבר
3. צור אפליקציה חדשה (Application)
4. בחר את ה-Authentication providers:
   - ✅ Google OAuth
   - ✅ Apple OAuth
   - ✅ Email & Password (אופציונלי)

### שלב 2: העתק את המפתחות

מתוך ה-dashboard של Clerk:
1. לך ל-**API Keys**
2. העתק את המפתחות הבאים

צור קובץ `.env.local` בשורש הפרויקט:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/weather_db"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### שלב 3: הגדר Redirect URLs ב-Clerk Dashboard

ב-Clerk Dashboard > **Paths**:

**Redirect URLs:**
```
http://localhost:3000/he
http://localhost:3000/en
http://localhost:3000/he/sign-in
http://localhost:3000/en/sign-in
```

**OAuth Redirect URLs (אוטומטי):**
Clerk יגדיר אוטומטית, אבל וודא שהם כוללים:
```
http://localhost:3000/api/auth/callback
```

---

## 🗄️ הגדרת Database

### יצירת המיגרציה:

```bash
# Generate Prisma Client (כבר נעשה)
npx prisma generate

# Create migration
npx prisma migrate dev --name add-user-model

# (אופציונלי) Reset database
npx prisma migrate reset --force
```

### Schema שכבר הוגדר:

```prisma
model User {
  id          String     @id @default(cuid())
  clerkId     String     @unique
  email       String?
  name        String?
  preferences Json?
  userCities  UserCity[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model UserCity {
  id        String   @id @default(cuid())
  userId    String
  cityId    String
  sortOrder Int      @default(0)
  user      User     @relation(...)
  city      City     @relation(...)
}
```

---

## 🧪 בדיקת ההתקנה

### 1. הרץ את השרת:
```bash
npm run dev
```

### 2. נווט לדף הגדרות:
```
http://localhost:3000/he/settings
```

**תוצאה צפויה:**
- 🔒 אתה **תופנה** לדף ההתחברות של Clerk
- ✅ אם אתה מחובר, תראה את דף ההגדרות

### 3. התחבר עם Google/Apple:
- לחץ על "התחבר עם Google" או "התחבר עם Apple"
- השלם את ההתחברות
- תופנה בחזרה לאפליקציה

### 4. בדוק סנכרון:
- פתח את ה-Console (F12)
- חפש logs של `useUserSync`
- וודא שאין שגיאות

---

## 📊 Routes המוגנים

הרשימה הנוכחית של routes שדורשים התחברות:

```typescript
// middleware.ts
const isProtectedRoute = createRouteMatcher([
  '/(he|en)/settings(.*)',
  '/(he|en)/profile(.*)',
]);
```

### להוסיף routes נוספים:
ערוך את `middleware.ts` והוסף patterns:
```typescript
const isProtectedRoute = createRouteMatcher([
  '/(he|en)/settings(.*)',
  '/(he|en)/profile(.*)',
  '/(he|en)/admin(.*)',  // דוגמה
]);
```

---

## 🔄 איך זה עובד

### 1. **כניסה לאפליקציה:**
```
User → /he/settings
  ↓
Middleware checks: isProtectedRoute? Yes
  ↓
Clerk checks: isAuthenticated? No
  ↓
Redirect to: /he/sign-in
```

### 2. **אחרי התחברות:**
```
User signs in with Google
  ↓
Clerk returns to: / (AFTER_SIGN_IN_URL)
  ↓
AuthSync component runs useUserSync hook
  ↓
Calls: POST /api/user/sync (saves to PostgreSQL)
  ↓
Calls: GET /api/user/preferences (loads preferences)
  ↓
Updates: useWeatherStore with user data
```

### 3. **שינוי הגדרות:**
```
User changes language/theme/unit
  ↓
useUserSync detects change (2s debounce)
  ↓
Calls: POST /api/user/preferences
  ↓
Saves to PostgreSQL
```

---

## 🎯 קומפוננטות Authentication

### להוסיף כפתור Sign In:
```tsx
import { SignInButtons } from '@/features/auth';

<SignInButtons />
```

### להוסיף User Profile:
```tsx
import { UserProfile } from '@/features/auth';
import { useUser } from '@clerk/nextjs';

const { user } = useUser();

{user && (
  <UserProfile user={{
    id: user.id,
    clerkId: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    name: user.fullName,
  }} />
)}
```

### להוסיף Sign Out:
```tsx
import { SignOutButton } from '@clerk/nextjs';

<SignOutButton>
  <Button>התנתק</Button>
</SignOutButton>
```

---

## 🐛 Troubleshooting

### בעיה: "Invalid publishable key"
**פתרון:** וודא ש-`.env.local` קיים ומכיל את המפתחות הנכונים

### בעיה: Redirect loop
**פתרון:** בדוק ש-`NEXT_PUBLIC_CLERK_SIGN_IN_URL` מוגדר כ-`/sign-in`

### בעיה: Database error
**פתרון:** הרץ `npx prisma migrate dev`

### בעיה: User not syncing
**פתרון:** בדוק ש-`AuthSync` component מחובר ב-layout

---

## 📚 Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js 15 + Clerk](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk + i18n](https://clerk.com/docs/components/localization)
- [Prisma Docs](https://www.prisma.io/docs/)

---

## ✅ Checklist הפעלה

- [ ] יצרתי חשבון Clerk
- [ ] הוספתי Google/Apple OAuth providers
- [ ] העתקתי את המפתחות ל-`.env.local`
- [ ] הגדרתי Redirect URLs ב-Clerk Dashboard
- [ ] הרצתי `npx prisma migrate dev`
- [ ] הרצתי `npm run dev`
- [ ] ניווטתי ל-`/he/settings` ובדקתי redirect
- [ ] התחברתי בהצלחה
- [ ] בדקתי סנכרון הגדרות

**כשכל ה-checklist מסומן ✅ - Authentication פועל במלואו!** 🎉

