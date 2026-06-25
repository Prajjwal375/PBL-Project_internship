import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PBL Intelligence",
  description: "CSV-backed program intelligence and grant reporting workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
        <Sidebar />
        <div className="flex min-h-screen min-w-0 flex-col pl-72">
          <Header />
          <div className="mt-20 flex flex-1 flex-col">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
