import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TrpcProvider } from "./providers";
import "./globals.css";

/* eslint-disable @typescript-eslint/quotes, new-cap */
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app"
};
/* eslint-enable @typescript-eslint/quotes */

const RootLayout: React.FC<{ readonly children: React.ReactNode }> = ({
  children
}) => (
  <html lang="en">
    <body className={inter.className}>
      <TrpcProvider>{children}</TrpcProvider>
    </body>
  </html>
);

export default RootLayout;