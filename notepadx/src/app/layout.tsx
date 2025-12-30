import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ToastProvider from "@/components/providers/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "NotepadX",
    template: "%s - NotepadX"
  },
  description: "A modern note-taking application with rich formatting, sharing, and organization features.",
  keywords: ["notes", "notepad", "writing", "productivity", "markdown", "rich text"],
  authors: [{ name: "NotepadX" }],
  creator: "NotepadX",
  publisher: "NotepadX",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://notepadx.com",
    siteName: "NotepadX",
    title: "NotepadX - Modern Note Taking",
    description: "Create, organize, and share your notes with rich formatting and powerful features.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NotepadX - Modern Note Taking",
    description: "Create, organize, and share your notes with rich formatting and powerful features.",
    creator: "@notepadx",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <ToastProvider />
      </body>
    </html>
  );
}
