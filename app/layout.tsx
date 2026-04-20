import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Nastaliq_Urdu } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { StoreHeader } from "@/components/StoreHeader";
import { AlertBanner } from "@/components/AlertBanner";
import "./globals.css";
import { getLowStockCount } from "@/actions/products.action";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-urdu",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Maal Manager | Al-Madina General Store",
  description:
    "Inventory management and reorder alerts for Al-Madina General Store, Gulberg Lahore.",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏪</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const alertCount = await getLowStockCount();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoUrdu.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground text-[15px] md:text-[16.5px]">
        <Navbar alertCount={alertCount} />
        <div className="min-h-screen md:pl-60">
          <StoreHeader />
          <AlertBanner count={alertCount} />
          <main className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:px-6 md:pb-10 md:pt-6">
            {children}
          </main>
        </div>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
