import { ThemeProvider } from "next-themes";
import { ThemeModeProvider } from "@/components/ThemeModeProvider";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeModeProvider>{children}</ThemeModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
