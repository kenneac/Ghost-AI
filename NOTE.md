//todo:
implement the missing pages from:
Every folder representing a route can contain these specialized files:
• page.tsx: The unique UI for that route. Without this file, the route path cannot be accessed publicly.
• layout.tsx: Shared UI for a segment and its children (e.g., headers, footers, sidebars). It preserves state and does not re-render on navigation.
• loading.tsx: An automatic loading UI powered by React Suspense that shows instantly during data fetching.
• error.tsx: An isolated error boundary that catches runtime crashes for that segment without breaking the whole application.
• not-found.tsx: The fallback UI when a 404 error occurs within that section.