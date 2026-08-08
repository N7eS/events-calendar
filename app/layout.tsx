import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "مناسبات البراعصه",
  description: "موقع مناسبات وعزاء وافراح مطير البراعصه والمواعيد الرسمية",
  keywords: ["مناسبات البراعصه", "البراعصة", "براعصه", "براعصة", "موهه", "الموهه", "علوى", "افراح البراعصه", "موقع البراعصه", "مواعيد البراعصه"],
  verification: {
    google: "6SGk1eZ-8nKfLVFVaQ-d8RnUdah63EwS8oj-iQLMXNI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <meta name="google-site-verification" content="6SGk1eZ-8nKfLVFVaQ-d8RnUdah63EwS8oj-iQLMXNI" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}