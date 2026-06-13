import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrimeLink Donation - Support Our Mission",
  description:
    "Make a secure donation to PrimeLink Technologies and help us drive innovation and positive change. Pay via Stripe or M-Pesa.",
  keywords: "donation, PrimeLink Technologies, charity, fundraising, Stripe, M-Pesa",
  openGraph: {
    title: "PrimeLink Donation Platform",
    description: "Support PrimeLink Technologies — every donation drives impact.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
