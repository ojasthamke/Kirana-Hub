/** @type {import('next').NextConfig} */
const nextConfig = {
    // Only use static export when building for Capacitor
    output: process.env.IS_CAPACITOR === 'true' ? 'export' : undefined,
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
};

export default nextConfig;
