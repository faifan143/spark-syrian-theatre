import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Spark: Syria Theatre",
  description: "Strategy map experiment for the Syrian theatre of conflict.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#333",
              color: "#fff",
              fontWeight: "600",
              borderRadius: "8px",
            },
          }}
        />
      </body>
    </html>
  );
}
