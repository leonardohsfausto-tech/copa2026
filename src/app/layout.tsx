import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "@/components/convex-provider";
import { TopNav } from "@/components/top-nav";
import { ClerkProvider } from "@clerk/nextjs";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Copa 2026 - Mini SaaS",
  description: "Acompanhe e simule os resultados da Copa do Mundo 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${outfit.variable} ${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <ClerkProvider>
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
