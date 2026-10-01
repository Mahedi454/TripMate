const nextConfig = {
  reactStrictMode: true,
  images: {
    /**
     * The hero photos are 5504px and 5600px wide, so there is no risk of the
     * optimizer upscaling a source. 2560 is the widest the auth panel is ever
     * rendered at (a 2560x1440 viewport), which keeps every request a downscale.
     *
     * Must not start at 384: `imageSizes` already ends at 384, and the overlap
     * makes Next emit a srcset with two identical 384w descriptors, which
     * browsers reject outright (the image then never loads at all).
     */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560],
  },
};

export default nextConfig;