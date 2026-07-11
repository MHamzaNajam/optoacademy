import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OptoAcademy — DHA, MOH & HAAD Exam Preparation",
  description:
    "Mock exams and question banks for optometrists preparing for DHA, MOH, and HAAD licensing exams in the UAE.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
