import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import FooterSection from "@/components/footer";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Localette",
  description:
    "Helping local businesses easily create, customise, and display their unique shops to loving customers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={` ${dmSans.variable} antialiased bg-gradient-to-b from-zinc-50 to-amber-50 min-h-screen`}
        >
          <QueryProvider>
            {children}
            {/* <FooterSection /> */}
          </QueryProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
