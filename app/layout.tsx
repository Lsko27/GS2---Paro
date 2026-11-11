import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import AuthToast from "@/app/_components/auth-toast";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Parô | Pontos de Apoio",
  description:
    "Encontre pontos de apoio com água, banheiro e espaços de descanso perto de você.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${inter.className} flex min-h-full flex-col`}>
        {children}
        <Suspense fallback={null}>
          <AuthToast />
        </Suspense>
      </body>
    </html>
  );
}
