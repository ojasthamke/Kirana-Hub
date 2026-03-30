/** @type {import('next').NextConfig} */
const nextConfig = {
    // Use static export specifically for the APK during GitHub Actions
    // Local dev and Vercel will act as a standard full-stack environment
    output: process.env.GITHUB_ACTIONS ? 'export' : undefined,
    images: {
        unoptimized: true,
    },
    trailingSlash: false, // Removed to prevent "Invalid JSON" errors on mobile
};

export default nextConfig;
