import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Typeform Studio | Conversational Form Builder',
  description: 'Build polished forms with the signature one-question-at-a-time respondent flow.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fafafa] text-[#191919]">
        {children}
      </body>
    </html>
  );
}
