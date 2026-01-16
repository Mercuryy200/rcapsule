import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Providers } from "./providers";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { fontSans } from "@/config/fonts";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: {
    default: "Vesti — Your Digital Closet",
    template: `%s | Vesti`,
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
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased text-foreground",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 w-full max-w-7xl mx-auto px-6">
              {children}
              <Analytics />
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
