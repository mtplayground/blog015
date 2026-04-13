import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
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
  metadataBase: new URL(process.env.BASE_URL ?? "http://localhost:8080"),
  title: {
    default: "Blog015",
    template: "%s | Blog015",
  },
  description: "A simple blog built with Next.js and Prisma.",
  openGraph: {
    type: "website",
    title: "Blog015",
    description: "A simple blog built with Next.js and Prisma.",
    url: "/",
    siteName: "Blog015",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Blog015",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900">
        <Header />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
