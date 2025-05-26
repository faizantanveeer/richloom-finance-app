// app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Richloom",
  description: "Your Finances, Grown Smart",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} p-0 m-0`}>
        {/* Everything inside here is now safely client-side */}
        <ClerkProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />
          <Footer className="bg-blue-50 py-12" />
        </ClerkProvider>
      </body>
    </html>
  );
}
