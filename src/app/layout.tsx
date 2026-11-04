import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScholarVector - DBMS Level 3 Mini-Project',
  description: 'AI-Powered Research Paper Semantic Search & Retrieval System using PostgreSQL and pgvector',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
