import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepairPro Cloud",
  description: "Cloud-based repair shop management system"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
