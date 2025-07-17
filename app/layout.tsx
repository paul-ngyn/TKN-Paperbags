import type { Metadata } from "next";
import localFont from "next/font/local";
import '../app/globals.css';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { AuthProvider } from './contexts/AuthContext'
import Script from 'next/script';

// Add these two imports
import NavBar from './components/NavBar/NavBar';
import Footer from './components/Footer/Footer';

const geistSans = localFont({
  src: "../app/public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../app/public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "TKN Bags - Custom Paper Bags",
  description: "TKN BY MTC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
          strategy="beforeInteractive"
        />
        <Script
          id="pdf-worker-setup"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && window.pdfjsLib) {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              }
            `,
          }}
        />
        <AuthProvider>
          <NavBar />
          <div className="container">
            {children}
          </div>
          <Footer />
          <SpeedInsights/>
        </AuthProvider>
      </body>
    </html>
  );
}