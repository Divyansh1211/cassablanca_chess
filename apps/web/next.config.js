/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self'; 
              script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
              style-src 'self' 'unsafe-inline'; 
              connect-src 'self' http://api.divyansh.lol ws://ws.divyansh.lol; 
              img-src 'self' data:;
            `.replace(/\s{2,}/g, " "), // Removes unnecessary spaces
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "http://chess.divyansh.lol",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
