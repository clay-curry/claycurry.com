/*
A loading file can create instant loading states built on Suspense.

By default, this file is a Server Component - but can also be used as a Client Component through the "use client" directive.

app/feed/loading.tsx
*/


export default function Loading() {
  // Or a custom loading skeleton component
  return <p>Loading...</p>
}