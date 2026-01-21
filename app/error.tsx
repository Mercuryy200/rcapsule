// app/error.tsx
"use client";
import * as Sentry from "@sentry/nextjs";

export default function ErrorPage({ error }: { error: Error }) {
  const eventId = Sentry.captureException(error);

  return (
    <div>
      <h1>Something went wrong</h1>
      <button
        onClick={() => {
          Sentry.showReportDialog({ eventId });
        }}
      >
        Report feedback
      </button>
    </div>
  );
}
