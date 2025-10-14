import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilitar output standalone para Docker
  output: 'standalone',
  
  // Configurações de produção
  poweredByHeader: false,
  compress: true,
  
  // Ignorar erros de TypeScript e ESLint durante build (para BETA)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configurações de imagem
  images: {
    domains: ['supabase.co'],
    unoptimized: false,
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Configurações de pacotes externos (Next.js 15+)
  serverExternalPackages: ['@supabase/supabase-js'],
};

export default nextConfig;
