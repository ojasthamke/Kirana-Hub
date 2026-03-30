/** @type {import('next').NextConfig} */
const nextConfig = {
    // Only use static export locally for the APK (avoid it on Vercel)
    output: process.env.VERCEL ? undefined : 'export',
    images: {
        unoptimized: true,
    },
    trailingSlash: false, // Removed to prevent "Invalid JSON" errors on mobile
};

export default nextConfig;
