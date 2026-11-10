import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";
import { AssistantWidget, SiteFooter, SiteHeader } from "@/app/components/site-shell";

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Luxion Solar | A brighter way forward",
    template: "%s | Luxion Solar",
  },
  description:
    "Thoughtful solar solutions for homes and businesses. Explore your energy options with Luxion Solar.",
  openGraph: {
    title: "Luxion Solar | A brighter way forward",
    description:
      "Thoughtful solar solutions for homes and businesses. Explore your energy options with Luxion Solar.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} ${manrope.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <a className="whatsapp-fixed" href="https://wa.me/2348000000000" target="_blank" rel="noreferrer" aria-label="Chat with Luxion Solar on WhatsApp">◉</a>
        <AssistantWidget />
      </body>
    </html>
  );
}
