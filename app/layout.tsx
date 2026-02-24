import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Analytics } from "@vercel/analytics/next";
import * as Sentry from "@sentry/nextjs";
import { Toaster } from "sonner";

import { Providers } from "./providers";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { fontSans, fontDisplay } from "@/lib/config/fonts";
import ScrollToTop from "@/components/ui/ScrollToTop";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,

  beforeSend(event, hint) {
    if (process.env.NODE_ENV === "development") {
      return null;
    }

    return event;
  },
});

// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: "Rcapsule — Your Digital Closet",
    template: `%s | Rcapsule`,
  },
  description:
    "Organize your wardrobe and plan outfits with ease using Rcapsule.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Rcapsule — Your Digital Closet",
    description:
      "Organize your wardrobe and plan outfits with ease using Rcapsule.",
    url: "https://rcapsule.com",
    siteName: "Rcapsule",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <script
          async
          defer
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        />
      </head>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased text-foreground",
          fontSans.variable,
          fontDisplay.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 w-full">
              {children}
              <Toaster richColors position="top-right" />
              <Analytics />
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
