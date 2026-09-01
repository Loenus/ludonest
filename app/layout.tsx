import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LudoNest",
  description: "Trova ludopub vicino a te, prenota tavoli e gestisci il tuo locale",
};

export const generateViewport = () => ({
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f8f3eb" }, { media: "(prefers-color-scheme: dark)", color: "#0b0b0f" }],
});

const themeScript = `
  (function() {
    try {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const root = document.documentElement;
      root.classList.toggle('dark', prefersDark);
      root.style.colorScheme = prefersDark ? 'dark' : 'light';
      root.style.backgroundColor = prefersDark ? '#0b0b0f' : '#f8f3eb';
      document.body && (document.body.style.backgroundColor = prefersDark ? '#0b0b0f' : '#f8f3eb');

      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', prefersDark ? '#0b0b0f' : '#f8f3eb');
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", figtree.variable)}
    >
      <head>
        <meta name="theme-color" content="#f8f3eb" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
