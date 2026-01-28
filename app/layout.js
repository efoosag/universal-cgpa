import { ThemeProvider } from "next-themes";
import { ThemeModeProvider } from "@/components/ThemeModeProvider";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning ={true}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeModeProvider>{children}</ThemeModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
