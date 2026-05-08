import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

// 1. Configuration des polices
// "Inter" est la police principale du design system Kaskade
const sans = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

// "JetBrains Mono" pour les éléments techniques (comme le compteur %)
const mono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// 2. Configuration SEO & Metadata avancée
export const metadata: Metadata = {
  metadataBase: new URL("https://kaskade.com"),
  title: {
    default: "Kaskade.com | L'Innovation Digitale",
    template: "%s | Kaskade.com",
  },
  description: "Plateforme immersive et solutions digitales de nouvelle génération.",
  applicationName: "Kaskade",
  authors: [{ name: "Kaskade Team", url: "https://kaskade.com" }],
  keywords: ["Digital", "Creative", "Agency", "Web3", "UI/UX"],
  creator: "Kaskade Team",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://kaskade.com",
    title: "Kaskade.com",
    description: "L'avenir du design numérique commence ici.",
    siteName: "Kaskade.com",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Kaskade Preview",
      },
    ],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

// 3. Configuration du Viewport (Mobile)
export const viewport: Viewport = {
  themeColor: "#FFFFFF", // Mise à jour vers Blanc (Light Mode)
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`
          ${sans.variable} ${mono.variable} ${serif.variable}
          bg-[#FFFFFF] text-[#1A1D21] 
          antialiased overflow-x-hidden selection:bg-[#f97415] selection:text-[#FFFFFF] font-sans
        `}
      >
        {/* Wrapper principal */}
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
             {children}
          </div>
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}