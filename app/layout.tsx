import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Tus flores amarillas 🌻',
  description: 'Un universo de girasoles y mensajes de cariño. Estas flores amarillas son solo para ti.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Tus flores amarillas 🌻',
    description: 'Un universo de flores, solo para ti.',
    type: 'website',
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
