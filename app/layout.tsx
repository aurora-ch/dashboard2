import "./globals.css";
import { Providers } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Aurora Dashboard",
  description: "AI Receptionist platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground antialiased",
          // subtle glass texture baseline
          "[--glass-bg:theme(colors.background/0.6)]"
        )}
      >
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}