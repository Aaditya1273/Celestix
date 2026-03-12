import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Search from '@/components/common/Misc/Search';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'Pixen Flow: Stunning, Animated & Interactive React UI Components',
    description: 'Discover Pixen Flow, an open-source library of stunning, animated, and interactive React UI components.',
    keywords: ['react components', 'ui components', 'animations', 'three.js', 'framer motion'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans antialiased bg-black text-white`}>
                <Providers>
                    <Search />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
