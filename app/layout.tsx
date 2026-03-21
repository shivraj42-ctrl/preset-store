import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import PlasmaBackground from "@/components/PlasmaBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "XMP Store — Premium Lightroom Presets",
    template: "%s | XMP Store",
  },
  description:
    "Transform your photos instantly with premium Lightroom Classic presets. Browse, preview, and download professional-grade presets used by top creators.",
  keywords: ["Lightroom presets", "photo editing", "photography", "presets download", "XMP presets"],
  openGraph: {
    title: "XMP Store — Premium Lightroom Presets",
    description:
      "Transform your photos instantly with premium Lightroom Classic presets used by top creators.",
    type: "website",
    siteName: "XMP Store",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-purple-600 focus:text-white"
        >
          Skip to main content
        </a>

        {/* Razorpay Checkout Script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />

        <AuthProvider>
          <PlasmaBackground />
          <div className="relative z-10">
            {children}
          </div>
        </AuthProvider>

      </body>
    </html>
  );
}