import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "@/components/convex-provider";
import { TopNav } from "@/components/top-nav";
import { ClerkProvider } from "@clerk/nextjs";

import { ptBR } from "@clerk/localizations";
import { dark } from "@clerk/themes";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Copa do Mundo 2026 - Simulador Pro",
  description: "Acompanhe, simule e gerencie seus palpites para a Copa do Mundo 2026. O simulador definitivo com dados em tempo real e interface premium.",
  openGraph: {
    title: "Copa do Mundo 2026 - Simulador Pro",
    description: "O simulador definitivo para a maior Copa de todos os tempos.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Copa do Mundo 2026",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Copa do Mundo 2026 - Simulador Pro",
    description: "Simule os resultados da Copa 2026 com tecnologia de ponta.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${outfit.variable} ${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <ClerkProvider
          localization={ptBR}
          afterSignOutUrl="/"
          signInFallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#eab308",
              colorBackground: "#1a1a1a",
              colorText: "white",
              colorTextSecondary: "#a1a1aa",
            },
            elements: {
              rootBox: "flex justify-center items-center w-full h-full",
              card: "bg-transparent shadow-none w-full max-w-[400px] mx-auto",
              socialButtonsBlockMain: "flex flex-row gap-3 flex-nowrap",
              socialButtonsBlockButton: "flex-1 min-h-[44px] border-white/10",
              socialButtonsProviderIcon: "w-5 h-5",
              footer: "hidden",
            }
          }}
        >
          <ConvexClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <div className="flex flex-col h-screen overflow-hidden">
                {/* NAVEGAÇÃO POR ABAS SUPERIORES */}
                <TopNav />

                <main className="flex-1 relative overflow-y-auto overflow-x-hidden pt-10">
                  {children}
                </main>
              </div>
            </ThemeProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
