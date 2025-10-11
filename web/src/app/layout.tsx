import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { AgentProvider } from "@/contexts/AgentContext";
import { disableConsoleInProduction } from "@/lib/security/disable-console-production";
import "./globals.css";

// SEC-004: Desabilitar console.log em produção para prevenir exposição de dados sensíveis
disableConsoleInProduction();
// Forçar renderização dinâmica em toda a aplicação para evitar erros de prerender no build BETA
export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus Agents - Plataforma de IA",
  description: "Plataforma para gerenciar agentes de IA em múltiplos canais de comunicação",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__PUBLIC_CONFIG__ = ${JSON.stringify({
              supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
              supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null,
            })};`,
          }}
        />
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange
        >
          <AgentProvider>
            {children}
            <Toaster />
          </AgentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
