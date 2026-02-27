import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import BackButton from "@/components/layout/BackButton";
import { CartProvider } from "../context/CartContext";
import { getAuthSession } from "../lib/auth";

export const metadata: Metadata = {
    title: "KiranaHub | Multi-Vendor B2B Wholesale Marketplace",
    description: "India's smartest wholesale Kirana marketplace. Order from multiple vendors in a single cart.",
    keywords: "kirana, wholesale, b2b, marketplace, grocery, india",
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const session = getAuthSession();
    return (
        <html lang="en">
            <head>
                <meta name="theme-color" content="#ffffff" />
            </head>
            <body style={{ margin: 0, padding: 0, background: '#f8fafc' }}>
                <CartProvider>
                    <Navbar session={session} />
                    <BackButton />
                    <main style={{ minHeight: 'calc(100vh - 65px)' }}>{children}</main>
                </CartProvider>
            </body>
        </html>
    );
}
