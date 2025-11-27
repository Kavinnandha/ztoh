import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ModalProvider } from "@/components/providers/ModalProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Zero to Hero | ",
  description: "Join Zero to Hero for top-tier tutoring and mentorship. Transform your potential into success with our expert-led courses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={cn(
          "min-h-screen bg-slate-50 font-sans antialiased flex flex-col",
          inter.variable,
          plusJakarta.variable
        )}
      >
        <ModalProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ModalProvider>
      </body>
    </html>
  );
}
