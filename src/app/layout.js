import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";

export const metadata = {
  title: "AI Quiz Generator",
  description: "Generate quizzes and build folder-based quiz sets with PostgreSQL.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}

