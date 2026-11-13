import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jazz Booking",
  description: "Booking-Arbeitsplatz für Jazzbands",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex">
        <aside className="app-sidebar">
          <Link href="/" className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">JB</span>
            <div>
              <strong>Jazz Booking</strong>
              <span>Arbeitsplatz</span>
            </div>
          </Link>
          <nav className="app-nav" aria-label="Hauptnavigation">
            <Link href="/">Übersicht</Link>
            <Link href="/bands">Bands</Link>
            <Link href="/venues">Clubs & Festivals</Link>
            <Link href="/bookings">Bookings</Link>
            <Link href="/email-drafts">E-Mail-Entwürfe</Link>
          </nav>
          <ThemeToggle />
        </aside>
        <div className="app-content">{children}</div>
      </body>
    </html>
  );
}
