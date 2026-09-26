import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mountain Viewer & Architect | 3D Terrain Studio",
  description: "Interactive 3D mountain terrain viewport with high-precision DEM, three-mesh-bvh snapping, and generative AI architecture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full w-full">
      <body className="h-full w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
        {children}
      </body>
    </html>
  );
}
