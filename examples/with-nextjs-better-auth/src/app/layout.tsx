import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

/* eslint-disable @stylistic/quotes */
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "discordkit — Next.js + Better Auth example",
  description:
    "Discord login with Better Auth, then authenticated Discord API calls with @discordkit/client"
};
/* eslint-enable @stylistic/quotes */

const RootLayout: React.FC<{ readonly children: React.ReactNode }> = ({
  children
}) => (
  <html lang="en">
    <body className={inter.className}>
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
