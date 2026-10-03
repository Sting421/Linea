import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Linea',
  description: 'Voice-first automated welfare check-ins for older adults.',
  icons: { icon: '/linea-mark.svg' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
