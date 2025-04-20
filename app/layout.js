
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

import {ClerkProvider} from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });
// This layout is used for all pages in the app

export const metadata = {
  title: "Richloom",
  description: "Your Finances, Grown Smart",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} p-0 m-0`}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer className="bg-blue-50 py-12" />
        </body>
      </html>
    </ClerkProvider>
  );
}
