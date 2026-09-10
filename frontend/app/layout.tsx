import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HireMind AI — Job Intelligence & Interview Prep",
  description:
    "Understand your job match, close skill gaps, and prepare for interviews with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
