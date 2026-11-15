import type { Metadata, Viewport } from "next";
import "@fontsource-variable/outfit";
import "@fontsource-variable/hanken-grotesk";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import Ambient from "@/components/Ambient";
import Splash from "@/components/Splash";

export const metadata: Metadata = {
  title: "TJC Seremban Coffee",
  description: "Church coffee ordering. Waiters order, baristas make.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#060606",
};

// Runs before first paint: skip the opening splash if it already played this session.
const NO_SPLASH = `try{if(sessionStorage.getItem('tjc-splash'))document.documentElement.classList.add('no-splash')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_SPLASH }} />
      </head>
      <body>
        <Ambient />
        <Splash />
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
