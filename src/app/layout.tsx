import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ToastProvider from "@/components/providers/ToastProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeWrapper from "@/components/ThemeWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "NotepadX - Transform Your Ideas Into Action | Voice-Powered Note Taking",
    template: "%s - NotepadX"
  },
  description: "The most powerful note-taking app for modern professionals. Voice input in multiple languages, beautiful themes, real-time collaboration, and seamless sharing. Start free today!",
  keywords: [
    "note taking app",
    "voice input notes", 
    "multilingual voice notes",
    "Urdu to English notes",
    "productivity app",
    "note sharing",
    "collaborative notes",
    "rich text editor",
    "note organization",
    "WhatsApp sharing",
    "dark theme notes",
    "professional note taking",
    "notepad",
    "writing",
    "markdown"
  ],
  authors: [{ name: "NotepadX Team" }],
  creator: "NotepadX",
  publisher: "NotepadX",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://notepadx.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "NotepadX - Transform Your Ideas Into Action",
    description: "Voice-powered note taking with multilingual support. Create, organize, and share your notes with advanced features like voice input, rich text editing, and real-time collaboration.",
    url: "https://notepadx.vercel.app",
    siteName: "NotepadX",
    images: [
      {
        url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "NotepadX - Modern Note Taking App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NotepadX - Voice-Powered Note Taking",
    description: "Transform your productivity with advanced note-taking features. Voice input, beautiful themes, and seamless collaboration.",
    images: ["https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"],
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            <ThemeWrapper>
              <Navbar />
              <main className="min-h-screen">
                {children}
              </main>
              <ToastProvider />
            </ThemeWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
