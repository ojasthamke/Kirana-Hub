import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { CartProvider } from "@/context/CartContext";
import { getAuthSession } from "@/lib/auth";

export const metadata: Metadata = {
    title: "Kirana Hub | Multi-Vendor B2B Marketplace",
    description: "Wholesale Kirana marketplace for shop owners",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = getAuthSession();
    return (
        <html lang="en">
            <body>
                <CartProvider>
                    <Navbar session={session} />
                    <main>{children}</main>
                </CartProvider>
            </body>
        </html>
    );
}
