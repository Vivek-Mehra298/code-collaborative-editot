import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "DevSync - Collaborative Real-Time Editor",
  description: "Code together, ship faster. A futuristic platform for real-time collaborative coding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-white bg-[#0a0a0f]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
