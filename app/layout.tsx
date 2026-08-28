export const metadata = {
  title: "Jarvis",
  description: "Kunal's life operating system",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body style={{ margin: 0, background: "#0a0a0a", color: "#f2f2f2", fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
