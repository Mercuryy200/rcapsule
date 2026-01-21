import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  tracesSampleRate: 1.0,

  beforeSend(event) {
    if (event.request?.cookies) {
      delete event.request.cookies;
    }

    if (event.request?.headers?.authorization) {
      delete event.request.headers.authorization;
    }

    return event;
  },
});
