import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Providers } from "./providers";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { fontSans } from "@/config/fonts";
import { Analytics } from "@vercel/analytics/next";
import ScrollToTop from "@/components/ui/ScrollToTop";
import * as Sentry from "@sentry/nextjs";
import { Toaster } from "sonner";

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

export const metadata: Metadata = {
  title: {
    default: "Capsule — Your Digital Closet",
    template: `%s | Capsule`,
  },
  description: "Organize your wardrobe and plan outfits with ease.",
  icons: {
    icon: "/favicon.ico",
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
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          async
          defer
        />
      </head>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased text-foreground",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 w-full max-w-7xl mx-auto px-6">
              {children}
              <Toaster position="top-right" richColors />
              <Analytics />
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
