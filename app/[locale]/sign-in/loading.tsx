'use client';

// For the sign-in route itself, let Clerk's UI handle its own loading states.
// We intentionally render nothing here to avoid a second full-screen loader
// after a dedicated sign-out screen has already been shown.
export default function Loading() {
  return null;
}

