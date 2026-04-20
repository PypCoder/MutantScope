import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MutantScope — Protein Mutation Analysis Platform",
  description: "Powered by SERAPH. Analyze the structural impact of protein mutations with AI-driven secondary structure prediction.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}