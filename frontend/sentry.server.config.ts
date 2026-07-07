import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

function isValidSentryDsn(value: string | undefined): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value !== "https://frontend-dsn-here" &&
    !value.includes("frontend-dsn-here") &&
    /^https?:\/\/[^/\s]+@[^/\s]+\/\d+/.test(value)
  );
}

if (isValidSentryDsn(dsn)) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.Authorization;
        delete event.request.headers.cookie;
        delete event.request.headers.Cookie;
      }

      return event;
    },
  });
}